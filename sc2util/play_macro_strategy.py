import json
import numpy as np
import os
from tqdm import tqdm
import imutil

import pysc2_util
from random_agent import RandomAgent
from environments.macro_strategy_environment import MacroStrategyEnvironment


DATASET_NAME = 'sc2_macro_strategy'
os.makedirs(DATASET_NAME + '/images', exist_ok=True)


def create_dataset(dataset_size=80000):
    # This environment teaches win/loss outcomes vs different enemies
    env = MacroStrategyEnvironment()
    agent = RandomAgent(env.action_space())

    fp = open('{}.dataset'.format(DATASET_NAME), 'w')

    for i in tqdm(range(dataset_size)):
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

        # Record the state before, and the state after selected_action was taken
        filename_initial = '{}/images/{:06d}_initial_ftr.png'.format(DATASET_NAME, i)
        filename_initial_rgb = '{}/images/{:06d}_initial_rgb.png'.format(DATASET_NAME, i)
        filename_outcome = '{}/images/{:06d}_outcome_ftr.png'.format(DATASET_NAME, i)
        filename_outcome_rgb = '{}/images/{:06d}_outcome_rgb.png'.format(DATASET_NAME, i)

        pysc2_util.save_sc2_feature_map_to_png(initial_state[1], filename_initial)
        imutil.show(initial_state[2], filename=filename_initial_rgb)

        pysc2_util.save_sc2_feature_map_to_png(outcome_state[1], filename_outcome)
        imutil.show(outcome_state[2], filename=filename_outcome_rgb)

        example = {
            'filename': filename_initial,
            'action': selected_action,
            'next_filename': filename_outcome,
            'rgb_filename': filename_initial_rgb,
            'next_rgb_filename': filename_outcome_rgb,
            'value': reward,
            'fold': 'test' if i % 10 == 0 else 'train',
        }
        fp.write(json.dumps(example) + '\n')
        print('Recorded episode {}/{}'.format(i, dataset_size))

        # Hack: Restart game every N episodes due to pysc2 limitations
        if (i + 1) % 1000 == 0:
            del env
            env = FourChoicesEnvironment()

    fp.close()


if __name__ == '__main__':
    create_dataset()
