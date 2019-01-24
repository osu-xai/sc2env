import os
import random
import numpy as np

from pysc2.env import sc2_env
from pysc2.lib import actions
import gym
from gym.spaces.discrete import Discrete

from sc2env.pysc2_util import register_map
from sc2env.representation import expand_pysc2_to_neural_input

MAP_NAME = 'MicroBattle'
MAP_SIZE = 64
RGB_SCREEN_SIZE = 256
END_BATTLE_RESET_TIMESTEPS = 10

UNIT_ID_LIST = [
    48,  # marine
    73,  # zealot
    105, # zergling
    #107, # hydra
    #109, # ultra
]

# A simple environment similar to SCAII-RTS Towers
# Follows the interface of OpenAI Gym environments
class MicroBattleEnvironment(gym.Env):
    def __init__(self, render=False):
        self.sc2env = make_sc2env(render)
        self.action_space = Discrete(self.actions())

    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.last_timestep = self.sc2env.step([action])[0]
        # Wait a few frames for particle effects to finish
        self.noop()
        self.noop()
        state, reward, done, info = unpack_timestep(self.last_timestep)
        self.timesteps_since_battle_end = 0
        return state

    def step(self, action):
        # TODO: take action
        # For now, actions have no effect.
        self.noop()

        state, reward, battle_done, info = unpack_timestep(self.last_timestep)
        if battle_done:
            self.timesteps_since_battle_end += 1
        episode_done = self.timesteps_since_battle_end > END_BATTLE_RESET_TIMESTEPS
        return state, reward, episode_done, info

    def noop(self):
        sc2_action = actions.FUNCTIONS.no_op()
        self.last_timestep = self.sc2env.step([sc2_action])[0]

    def can_attack(self):
        available_actions = self.last_timestep.observation.available_actions
        return actions.FUNCTIONS.Attack_minimap.id in available_actions

    def render(self):
        import imutil
        state, reward, done, info = unpack_timestep(self.last_timestep)
        feature_map, feature_screen, rgb_map, rgb_screen = state
        visual = np.concatenate([rgb_map, rgb_screen], axis=1)
        imutil.show(visual, save=False)

    def actions(self):
        # No action choice: all units attack at once
        return 2

    def layers(self):
        # One-hot unit ids plus metadata
        return len(UNIT_ID_LIST) + 6


# Create the low-level SC2Env object, which we wrap with
#  a high level Gym-style environment
def make_sc2env(render=False):
    rgb_dimensions = False
    if render:
        rgb_dimensions=sc2_env.Dimensions(
            screen=(RGB_SCREEN_SIZE, RGB_SCREEN_SIZE),
            minimap=(RGB_SCREEN_SIZE, RGB_SCREEN_SIZE))
    env_args = {
        'agent_interface_format': sc2_env.AgentInterfaceFormat(
            feature_dimensions=sc2_env.Dimensions(
                screen=(MAP_SIZE, MAP_SIZE),
                minimap=(MAP_SIZE, MAP_SIZE)
            ),
            rgb_dimensions=rgb_dimensions,
            action_space=actions.ActionSpace.FEATURES,
        ),
        'map_name': MAP_NAME,
        'step_mul': 4,
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'])
    return sc2_env.SC2Env(**env_args)


# Convert the timestep into a Gym-style tuple
def unpack_timestep(timestep):
    # The pysc2 representations include unit types and positions
    feature_map = np.array(timestep.observation.feature_minimap)
    feature_screen = np.array(timestep.observation.feature_screen)

    # The neural representation is appropriate for input to a neural network
    feature_screen_onehot = expand_pysc2_to_neural_input(feature_screen, UNIT_ID_LIST)

    # The RGB maps will be None if rendering is disabled (eg. for faster training)
    rgb_map = np.array(timestep.observation.get('rgb_minimap'))
    rgb_screen = np.array(timestep.observation.get('rgb_screen'))

    state = (feature_map, feature_screen_onehot, rgb_map, rgb_screen)

    # TODO: Extract multiple rewards
    # For this game we use a simple reward: number of surviving friendly units
    reward = int(timestep.observation.player['army_count'])

    # The game is done when no enemy, or no friendly units remain
    player_relative = np.array(timestep.observation.feature_screen['player_relative'])
    living_players = np.unique(player_relative)
    friendlies_alive = 1 in living_players
    enemies_alive = 4 in living_players
    done = not enemies_alive or not friendlies_alive

    # The info dict can include reward decompositions when available
    info = {}
    return state, reward, done, info
