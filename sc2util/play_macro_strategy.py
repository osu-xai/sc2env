import json
import random
import numpy as np
import os
from tqdm import tqdm
import imutil

import pysc2_util
from random_agent import RandomAgent
from environments import macro_strategy_environment
from environments.macro_strategy_environment import MacroStrategyEnvironment


DATASET_NAME = 'sc2_macro_strategy'
os.makedirs(DATASET_NAME + '/images', exist_ok=True)


def demo_task():
    # This environment involves choosing to build the right units
    env = MacroStrategyEnvironment()
    agent = RandomAgent(env.action_space())
    initial_state = env.reset()

    for i in range(100):
        # The state is a tuple of:
        #   features_minimap: np array of features from the minimap view
        #   features_screen: np array of features from the camera view
        #   rgb_minimap: np array of an RGB pixel view of the minimap
        #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II

        my_action = random.choice([1,2,6])
        enemy_action = agent.step(initial_state)
        # Take the action and simulate the game for one time step (~10 seconds)
        outcome_state, reward, done, info = env.step(my_action, enemy_action)


        top = imutil.show(outcome_state[2], resize_to=(800,480), return_pixels=True, display=False)
        bottom = imutil.show(outcome_state[3], resize_to=(800,480), return_pixels=True, display=False)
        filename = "output_frame_{:05d}.jpg".format(i)
        caption = 't={}  Left: {}  Right: {}'.format(
            env.steps,
            macro_strategy_environment.action_to_name[my_action],
            macro_strategy_environment.action_to_name[enemy_action])
        imutil.show(np.concatenate([top, bottom], axis=0), filename=filename, caption=caption)


if __name__ == '__main__':
    demo_task()
