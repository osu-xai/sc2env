import json
import numpy as np
import os
from tqdm import tqdm
import imutil

import pysc2_util
from random_agent import RandomAgent
from environments.four_choices import FourChoicesEnvironment


DATASET_NAME = 'sc2_four_choices'
os.makedirs(DATASET_NAME + '/images', exist_ok=True)


def train_agent(episodes=1000):
    # This environment teaches win/loss outcomes vs different enemies
    env = FourChoicesEnvironment()
    agent = RandomAgent(env.action_space())

    for i in tqdm(range(episodes)):
        # Each episode consists of a "before", a single action, and an "after"
        initial_state = env.reset()

        # The state is a tuple of:
        #   features_minimap: np array of features from the minimap view
        #   features_screen: np array of features from the camera view
        #   rgb_minimap: np array of an RGB pixel view of the minimap
        #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II

        # Select one of four actions
        selected_action = agent.step(initial_state)

        # Take the action and simulate the game for one time step (~10 seconds)
        outcome_state, reward, done, info = env.step(selected_action)

        print('Took action {} got reward {}'.format(selected_action, reward))

        # Record the state before, and the state after selected_action was taken
        filename_initial = '{}/images/{:06d}_initial_ftr.png'.format(DATASET_NAME, i)
        filename_outcome = '{}/images/{:06d}_outcome_ftr.png'.format(DATASET_NAME, i)
        pysc2_util.save_sc2_feature_map_to_png(initial_state[1], filename_initial)
        pysc2_util.save_sc2_feature_map_to_png(outcome_state[1], filename_outcome)


if __name__ == '__main__':
    train_agent()
