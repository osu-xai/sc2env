import os
import random
import numpy as np
import pysc2_util
from pysc2.env import sc2_env
from pysc2.lib import actions


# A simple environment similar to SCAII-RTS Towers
# Follows the interface of OpenAI Gym environments
class FourChoicesEnvironment():
    def __init__(self):
        self.sc2env = make_sc2env()

    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.last_timestep = self.sc2env.step([action])[0]

        state, reward, done, info = pysc2_util.unpack_timestep(self.last_timestep)
        return state

    # Action space: Choose which of four enemies to attack
    def action_space(self):
        from gym.spaces.discrete import Discrete
        return Discrete(4)

    # Step: Choose which enemy to attack
    def step(self, action):
        if self.can_attack():
            target = action_to_target(action)
            sc2_action = actions.FUNCTIONS.Attack_minimap("now", target)
        else:
            print('Cannot attack, taking no-op')
            sc2_action = actions.FUNCTIONS.no_op()

        self.last_timestep = self.sc2env.step([sc2_action])[0]
        return pysc2_util.unpack_timestep(self.last_timestep)

    def chat(self, message):
        self.sc2env.send_chat_messages([message])

    def can_attack(self):
        available = self.last_timestep.observation.available_actions
        return actions.FUNCTIONS.Attack_minimap.id in available


# The four actions tell the army to move to
# one of the four corners of the map
def action_to_target(action_id):
    x = random.random()
    map_size = 256
    padding = 64
    if action_id == 0:
        return [padding + x, padding + x]
    elif action_id == 1:
        return [map_size - padding - x, padding + x]
    elif action_id == 2:
        return [map_size - padding - x, map_size - padding - x]
    elif action_id == 3:
        return [padding + x, map_size - padding - x]


# Create the low-level SC2Env object, which we wrap with
#  a high level Gym-style environment
def make_sc2env():
    env_args = {
        'agent_interface_format': sc2_env.AgentInterfaceFormat(
            feature_dimensions=sc2_env.Dimensions(
                screen=(256,256),
                minimap=(256,256)
            ),
            rgb_dimensions=sc2_env.Dimensions(
                screen=(256,256),
                minimap=(256,256),
            ),
            action_space=actions.ActionSpace.FEATURES,
        ),
        'map_name': 'FourChoices',
        'step_mul': 170,  # 17 is ~1 action per second
    }
    register_map('', env_args['map_name'])
    quiet_absl()
    return sc2_env.SC2Env(**env_args)

