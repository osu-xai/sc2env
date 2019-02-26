import os
import random
import numpy as np

from pysc2.env import sc2_env
from pysc2.lib import actions
import gym
from gym.spaces.discrete import Discrete

import imutil
from sc2env.pysc2_util import register_map
from sc2env.representation import expand_pysc2_to_neural_input

MAP_NAME = 'SuperFourTowers'
MAP_SIZE = 64
RGB_SCREEN_SIZE = 256

SIMULATION_STEP_MUL = 5
BATTLE_SIMULATION_STEPS = 80
MOVE_SIMULATION_STEPS = 25

UNIT_ID_LIST = [
    48,  # marine
    51,  # marauder
    73,  # zealot
    105, # zergling
    107, # hydra
]

class SuperFourTowersEnvironment(gym.Env):
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
        return {
            'total_damage_taken': score.total_damage_taken.life,
            'total_damage_dealt': score.total_damage_dealt.life,
            'enemy_value_killed': score.killed_value_units,
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
        elif action == 0:
            # Attack Quadrant I: Northeast
            sc2_action_list.append(actions.FUNCTIONS.Attack_screen('now', (60.0, 4.0)))
        elif action == 1:
            # Attack Quadrant II: Northwest
            sc2_action_list.append(actions.FUNCTIONS.Attack_screen('now', (4.0, 4.0)))
        elif action == 2:
            # Attack Quadrant III: Southwest
            sc2_action_list.append(actions.FUNCTIONS.Attack_screen('now', (4.0, 60.0)))
        elif action == 3:
            # Attack Quadrant IV: Southeast
            sc2_action_list.append(actions.FUNCTIONS.Attack_screen('now', (60.0, 60.0)))

        # After issuing the above attack order, wait for a while for the attack to happen
        for i in range(BATTLE_SIMULATION_STEPS):
            sc2_action_list.append(actions.FUNCTIONS.no_op())

        # Issue an order to move back to the center of the screen
        sc2_action_list.append(actions.FUNCTIONS.Move_screen('now', (32.0, 32.0)))

        # Wait a while for the units to move back to their original position
        for i in range(MOVE_SIMULATION_STEPS):
            sc2_action_list.append(actions.FUNCTIONS.no_op())

        # Within this environment step, take many simulation steps
        # Optionally render each environment step in a separate function
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
        feature_screen_onehot = expand_pysc2_to_neural_input(feature_screen, UNIT_ID_LIST)

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


