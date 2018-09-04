import json
import random
import numpy as np
import os
from tqdm import tqdm
import imutil

import pysc2_util
from random_agent import RandomAgent
from environments import macro_strategy_environment
from environments.macro_strategy_environment import MacroStrategyEnvironment, action_to_name


def main():
    # This environment involves choosing to build the right units
    env = MacroStrategyEnvironment()
    blue_agent = RandomAgent(env.action_space())
    red_agent = RandomAgent(env.action_space())
    state = env.reset()

    for i in range(100):
        # The buildable units are named Rock, Paper, and Scissors
        # 1: Build paper in back
        # 2: Build paper in front
        # 3: Build rock in back
        # 4: Build rock in front
        # 5: Build scissors in back
        # 6: Build scissors in front
        # 7: Scout to reveal the enemy's army
        blue_action = blue_agent.step()
        red_action = red_agent.step()

        # Take the action and simulate the game for one time step (~10 seconds)
        state, reward, done, info = env.step(my_action, enemy_action)

        # The state is a tuple of:
        #   features_minimap: np array of features from the minimap view
        #   features_screen: np array of features from the camera view
        #   rgb_minimap: np array of an RGB pixel view of the minimap
        #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II
        features_minimap, features_screen, rgb_minimap, rgb_screen = state

        top = imutil.show(rgb_minimap, resize_to=(400,240), return_pixels=True, display=False)
        bottom = imutil.show(rgb_screen, resize_to=(400,240), return_pixels=True, display=False)
        filename = "output_frame_{:05d}.jpg".format(i)
        caption = 't={}  Left: {}  Right: {}'.format(
            env.steps, action_to_name[my_action], action_to_name[enemy_action])
        imutil.show(np.concatenate([top, bottom], axis=0), filename=filename, caption=caption)
        if done:
            print('Game is done')
            break

if __name__ == '__main__':
    main()
