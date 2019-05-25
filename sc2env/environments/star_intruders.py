import os
import random
import numpy as np

from pysc2.env import sc2_env
from pysc2.lib import actions
import gym
from gym.spaces.discrete import Discrete
from gym.spaces.box import Box

import imutil
from sc2env.pysc2_util import register_map
from sc2env.representation import int_map_to_onehot

MAP_DEFAULT = 'StarIntruders'
MAP_VARIANT_A = 'StarIntrudersVariantA'
MAP_VARIANT_B = 'StarIntrudersVariantB'
MAP_VARIANT_C = 'StarIntrudersVariantC'

MAP_SIZE = 64
RGB_SCREEN_SIZE = 256

SIMULATION_STEP_MUL = 5

UNIT_ID_LIST = [
    48,  # marine
    107, # hydralisk
    694, # disruptor
    733, # disruptor orb (fired from disruptor ship)
]

action_to_ability_id = {
    0: 3771,  # CustomButtonA, Move Disruptor Left
    1: 3773,  # CustomButtonA2, Fire
    2: 3775,  # CustomButttonB, Move Disruptor Right
    3: 3777,  # CustomButttonB2, Stop
}
action_to_name = {
    0: "Left",
    1: "Fire",
    2: "Right",
    3: "No-Op",
}

class StarIntrudersEnvironment(gym.Env):
    def __init__(self, map_name=MAP_DEFAULT, render=True, screen_size=RGB_SCREEN_SIZE,
                 map_size=MAP_SIZE, continuous_action_space=False):
        self.sc2env = make_sc2env(map_name, render, screen_size, map_size)
        self.continuous_action_space = continuous_action_space
        if self.continuous_action_space:
            # For compatibility with PlaNet-type architectures
            self.action_space = Box(low=-1.0, high=1.0, shape=(4,), dtype=np.float32)
        else:
            self.action_space = Discrete(4)

    # Reset the simulation to an initial state.
    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.last_timestep = self.sc2env.step([action])[0]

        # Wait a few frames for particle effects to finish.
        for _ in range(8):
            sc2_action = actions.FUNCTIONS.no_op()
            self.last_timestep = self.sc2env.step([sc2_action])[0]

        # Initialize per-episode state
        self.last_score = self.get_current_cumulative_score()
        self.timesteps_since_battle_end = 0

        # Observe the environment
        state, reward, done, info = self.unpack_observation()
        return state

    # Alter the state of the simulation by taking an action
    def step(self, action, animation_callback=None):
        # Keep track of the previous cumulative score to compute a difference
        self.last_score = self.get_current_cumulative_score()

        if self.continuous_action_space:
            # Convert continuous actions to the discrete [0, 1, 2, 3] set
            action = np.argmax(action)

        sc2_action_list = []
        self.use_custom_ability(action_to_ability_id[action])

        sc2_action = actions.FUNCTIONS.no_op()
        self.last_timestep = self.sc2env.step([sc2_action])[0]
        return self.unpack_observation()

    # Alters state, sends a command to SC2 bypassing pysc2
    def use_custom_ability(self, ability_id, player_id=1):
        # Sends a command directly to the SC2 protobuf API
        # Can cause the pysc2 client to desync, unless step_sc2env() is called afterward
        from s2clientprotocol import sc2api_pb2
        from s2clientprotocol import common_pb2
        from s2clientprotocol import spatial_pb2

        def get_action_spatial(ability_id):
            target_point = common_pb2.PointI()
            target_point.x = 0
            target_point.y = 0

            action_spatial_unit_command = spatial_pb2.ActionSpatialUnitCommand(target_minimap_coord=target_point)
            action_spatial_unit_command.ability_id = ability_id

            action_spatial = spatial_pb2.ActionSpatial(unit_command=action_spatial_unit_command)
            action = sc2api_pb2.Action(action_feature_layer=action_spatial)
            return action

        player_action = get_action_spatial(ability_id)
        request_action = sc2api_pb2.RequestAction(actions=[player_action])
        request = sc2api_pb2.Request(action=request_action)

        # Bypass pysc2 and send the proto directly
        client = self.sc2env._controllers[player_id - 1]._client
        #print('Calling client.send_req for player_id {}'.format(player_id))
        if self.sc2env._state == 2:
            print('Game is over, cannot send action')
            return
        client.send_req(request)

    # Helper function, does not alter state
    def get_current_cumulative_score(self):
        # Losing one friendly unit should be -1 reward and destroying one enemy +1 reward
        damage_taken = 0
        enemy_value_killed = 0
        if self.sc2env._obs:
            score = self.sc2env._obs[0].observation.score.score_details
            damage_taken = score.total_damage_taken.life + score.friendly_fire_minerals.army / 100.0
            enemy_value_killed = score.killed_value_units
        return {
            'total_damage_taken': -damage_taken,
            'enemy_value_killed': enemy_value_killed,
        }

    def render(self, *args, **kwargs):
        state, reward, done, info = self.unpack_observation()
        feature_map, feature_screen, rgb_map, rgb_screen = state
        visual = np.concatenate([rgb_map, rgb_screen], axis=1)
        result = imutil.get_pixels(rgb_screen, 64, 64) * 255
        return state

    def layers(self):
        # One-hot unit ids plus metadata
        return len(UNIT_ID_LIST) + 6

    # Convert the pysc2 observations into a Gym-style representation.
    # Idempotent, does not alter state.
    def unpack_observation(self):
        # The pysc2 representations include unit types and positions
        feature_map = np.array(self.last_timestep.observation.feature_minimap)
        feature_screen = np.array(self.last_timestep.observation.feature_screen)

        # The neural representation is appropriate for input to a neural network
        feature_screen_onehot = expand_to_neural_input(feature_screen)

        # The RGB maps will be None if rendering is disabled (eg. for faster training)
        rgb_map = np.array(self.last_timestep.observation.get('rgb_minimap'))
        rgb_screen = np.array(self.last_timestep.observation.get('rgb_screen'))

        state = (feature_map, feature_screen_onehot, rgb_map, rgb_screen)

        # The episode ends after either side is eliminated
        player_relative = np.array(self.last_timestep.observation.feature_screen['player_relative'])
        living_players = np.unique(player_relative)
        friendlies_alive = 1 in living_players
        enemies_alive = 4 in living_players
        done = not enemies_alive or not friendlies_alive

        # The info dict should include a decomposition of the reward, when available
        current_score = self.get_current_cumulative_score()
        info = {k: current_score[k] - self.last_score[k] for k in current_score.keys()}

        # Reward is a sum of several terms: see self.score
        total_reward = sum(info.values())
        return state, total_reward, done, info


class StarIntrudersBox(StarIntrudersEnvironment):
    def __init__(self, *args, **kwargs):
        kwargs['continuous_action_space'] = True
        super().__init__(*args, **kwargs)


class StarIntrudersVariantA(StarIntrudersEnvironment):
    def __init__(self, *args, **kwargs):
        kwargs['map_name'] = MAP_VARIANT_A
        super().__init__(*args, **kwargs)


class StarIntrudersVariantB(StarIntrudersEnvironment):
    def __init__(self, *args, **kwargs):
        kwargs['map_name'] = MAP_VARIANT_B
        super().__init__(*args, **kwargs)


class StarIntrudersVariantC(StarIntrudersEnvironment):
    def __init__(self, *args, **kwargs):
        kwargs['map_name'] = MAP_VARIANT_C
        super().__init__(*args, **kwargs)


# Create the low-level SC2Env object, which we wrap with
#  a high level Gym-style environment
def make_sc2env(map_name, render=False, screen_size=RGB_SCREEN_SIZE, map_size=MAP_SIZE):
    rgb_dimensions = False
    if render:
        rgb_dimensions=sc2_env.Dimensions(
            screen=(screen_size, screen_size),
            minimap=(screen_size, screen_size))
    env_args = {
        'agent_interface_format': sc2_env.AgentInterfaceFormat(
            feature_dimensions=sc2_env.Dimensions(
                screen=(map_size, map_size),
                minimap=(map_size, map_size)
            ),
            rgb_dimensions=rgb_dimensions,
            action_space=actions.ActionSpace.FEATURES,
        ),
        'map_name': map_name,
        'step_mul': SIMULATION_STEP_MUL,
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'])
    return sc2_env.SC2Env(**env_args)


# Input: A 17-dimensional integer pysc2 feature map
# See SCREEN_FEATURES in https://github.com/deepmind/pysc2/blob/master/pysc2/lib/features.py
# Output: A 4-dimensional float convolutional input map
# Contains only unit types
def expand_to_neural_input(feature_map, unit_map=UNIT_ID_LIST):
    neural_layers = []

    # Friendly/enemy masks are unnecessary if all zealots are friendly
    # Binary mask: friendly units
    #friendly_units = (feature_map[5] == 1).astype(float)
    #neural_layers.append(friendly_units)

    # Binary mask: enemy units
    #enemy_units = (feature_map[5] == 4).astype(float)
    #neural_layers.append(enemy_units)

    # Categorical map of unit types (see DEFAULT_SC2_UNITS)
    unit_layers = int_map_to_onehot(feature_map[6], unit_map)
    neural_layers.extend(unit_layers)

    # Unnecessary if all units die in one hit
    # Unit Health Points (scaled 0 to 1)
    #unit_hp = feature_map[9] / 255.
    #neural_layers.append(unit_hp)

    # Unit Shield Points (scaled 0 to 1)
    #unit_sp = feature_map[13] / 255.
    #neural_layers.append(unit_sp)

    # Unit density (number of overlapping units, important when zoomed out)
    #MAX_DENSITY = 4.
    #unit_density = np.clip(feature_map[15] / MAX_DENSITY, 0, 1)
    #neural_layers.append(unit_density)

    layers = np.array(neural_layers)
    return layers
