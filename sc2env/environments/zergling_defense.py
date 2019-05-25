import os
import random
import numpy as np

from pysc2.env import sc2_env
from pysc2.lib import actions
import gym
from gym.spaces.discrete import Discrete

import imutil
from sc2env.pysc2_util import register_map
from sc2env.representation import int_map_to_onehot

MAP_NAME = 'ZerglingDefense'
MAP_SIZE = 64
RGB_SCREEN_SIZE = 256

SIMULATION_STEP_MUL = 3
BATTLE_SIMULATION_STEPS = 3

UNIT_ID_LIST = [
    75,  # high_templar
    77,  # sentry
    83,  # immortal
    84,  # probe
    105, # zergling
    135, # force field
]

class ZerglingDefenseEnvironment(gym.Env):
    def __init__(self, render=True, screen_size=RGB_SCREEN_SIZE, map_size=MAP_SIZE):
        self.sc2env = make_sc2env(render, screen_size, map_size)
        self.action_space = Discrete(4)

    # Reset the simulation to an initial state. Alters state.
    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.last_timestep = self.sc2env.step([action])[0]

        # Wait a few frames for particle effects to finish.
        for _ in range(3):
            sc2_action = actions.FUNCTIONS.no_op()
            self.last_timestep = self.sc2env.step([sc2_action])[0]

        # Initialize per-episode state
        self.last_score = self.get_current_cumulative_score()
        self.timesteps_since_battle_end = 0

        # Observe the environment
        state, reward, done, info = self.unpack_observation()
        return state

    def get_current_cumulative_score(self):
        score = self.sc2env._obs[0].observation.score.score_details
        # Friendly units all have 1hp
        # Scale damage dealt so killing 1 zergling = +1 reward
        return {
            'total_damage_taken': -score.total_damage_taken.life,
            'total_damage_dealt': score.total_damage_dealt.life / 25.0,
            'enemy_value_killed': score.killed_value_units / 25.0,
            'friendly_value_alive': score.total_value_units,
        }

    # Alter the state of the simulation by taking an action
    def step(self, action, animation_callback=None):
        # Keep track of the previous cumulative score to compute a difference
        self.last_score = self.get_current_cumulative_score()

        sc2_action_list = []
        if not self.can_attack():
            # Nothing to do: no controllable units are present
            sc2_action_list.append(actions.FUNCTIONS.no_op())
        elif action == 0 and self.can_psi_storm():
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 77))
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 75))
            #sc2_action_list.append(actions.FUNCTIONS.select_control_group('recall', 1))
            sc2_action_list.append(actions.FUNCTIONS.Effect_PsiStorm_screen('now', (16.0, 34.0)))
        elif action == 1 and self.can_psi_storm():
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 77))
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 75))
            #sc2_action_list.append(actions.FUNCTIONS.select_control_group('recall', 1))
            sc2_action_list.append(actions.FUNCTIONS.Effect_PsiStorm_screen('now', (48.0, 34.0)))
        elif action == 2 and self.can_force_field():
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 75))
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 77))
            #sc2_action_list.append(actions.FUNCTIONS.select_control_group('recall', 2))
            sc2_action_list.append(actions.FUNCTIONS.Effect_ForceField_screen('now', (16.0, 26.0)))
        elif action == 3 and self.can_force_field():
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 75))
            #sc2_action_list.append(actions.FUNCTIONS.select_unit('deselect_all_type', 77))
            #sc2_action_list.append(actions.FUNCTIONS.select_control_group('recall', 2))
            sc2_action_list.append(actions.FUNCTIONS.Effect_ForceField_screen('now', (46.0, 26.0)))
        else:
            sc2_action_list.append(actions.FUNCTIONS.no_op())

        # After issuing the above attack order, wait for a while for the attack to happen
        for i in range(BATTLE_SIMULATION_STEPS):
            sc2_action_list.append(actions.FUNCTIONS.no_op())

        # Within this environment step, take many simulation steps
        # Optionally, use a callback to visualize each frame
        for sc2_action in sc2_action_list:
            if not self.can_attack():
                sc2_action = actions.FUNCTIONS.no_op()
            self.last_timestep = self.sc2env.step([sc2_action])[0]
            if animation_callback:
                animation_callback(*self.unpack_observation())

        return self.unpack_observation()

    def can_attack(self):
        available_actions = self.last_timestep.observation.available_actions
        return actions.FUNCTIONS.Attack_minimap.id in available_actions

    def can_psi_storm(self):
        available_actions = self.last_timestep.observation.available_actions
        return actions.FUNCTIONS.Effect_PsiStorm_screen.id in available_actions

    def can_force_field(self):
        available_actions = self.last_timestep.observation.available_actions
        return actions.FUNCTIONS.Effect_ForceField_screen.id in available_actions

    def render(self, *args, **kwargs):
        state, reward, done, info = self.unpack_observation()
        feature_map, feature_screen, rgb_map, rgb_screen = state
        visual = np.concatenate([rgb_map, rgb_screen], axis=1)
        imutil.show(visual, save=False)

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

        # The episode ends END_BATTLE_TIMESTEPS after either side is eliminated
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


# Create the low-level SC2Env object, which we wrap with
#  a high level Gym-style environment
def make_sc2env(render=False, screen_size=RGB_SCREEN_SIZE, map_size=MAP_SIZE):
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
        'map_name': MAP_NAME,
        'step_mul': SIMULATION_STEP_MUL,
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'])
    return sc2_env.SC2Env(**env_args)


# Input: A 17-dimensional integer pysc2 feature map
# See SCREEN_FEATURES in https://github.com/deepmind/pysc2/blob/master/pysc2/lib/features.py
# Output: A N-dimensional float convolutional input map, N = 7 + len(unit_map)
# Contains effects like psi-storm, required for ZerglingDefense
def expand_to_neural_input(feature_map, unit_map=UNIT_ID_LIST):
    neural_layers = []

    # Terrain height map, scaled 0 to 1
    #terrain_height = (feature_map[0] / 255.).astype(float)
    #neural_layers.append(terrain_height)

    # Binary mask: friendly units
    friendly_units = (feature_map[5] == 1).astype(float)
    neural_layers.append(friendly_units)

    # Binary mask: enemy units
    enemy_units = (feature_map[5] == 4).astype(float)
    neural_layers.append(enemy_units)

    # Categorical map of unit types (see DEFAULT_SC2_UNITS)
    unit_layers = int_map_to_onehot(feature_map[6], unit_map)
    neural_layers.extend(unit_layers)

    # Unit Health Points (scaled 0 to 1)
    unit_hp = feature_map[9] / 255.
    neural_layers.append(unit_hp)

    # Unit Shield Points (scaled 0 to 1)
    unit_sp = feature_map[13] / 255.
    neural_layers.append(unit_sp)

    # Unit density (number of overlapping units, important when zoomed out)
    MAX_DENSITY = 4.
    unit_density = np.clip(feature_map[15] / MAX_DENSITY, 0, 1)
    neural_layers.append(unit_density)

    # Area effects (psi-storm, EMP, etc)
    effect_map = (feature_map[16] > 0).astype(float)
    neural_layers.append(effect_map)

    layers = np.array(neural_layers)
    return layers


