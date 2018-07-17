import imutil
from tqdm import tqdm
from rts_environment import FourChoicesEnvironment
from random_agent import RandomAgent
import json

import os
DATASET_NAME = 'sc2_four_choices'
os.makedirs(DATASET_NAME + '/images', exist_ok=True)

def create_dataset(dataset_size=10000):
    # This environment teaches win/loss outcomes vs different enemies
    env = FourChoicesEnvironment()
    agent = RandomAgent(env.action_space())

    examples = []

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
        filename_initial = '{}/images/{:06d}_initial.png'.format(DATASET_NAME, i)
        filename_outcome = '{}/images/{:06d}_outcome.png'.format(DATASET_NAME, i)

        imutil.show(initial_state[2], filename=filename_initial)
        imutil.show(outcome_state[2], filename=filename_outcome)

        examples.append({
            'filename': filename_initial,
            'action': selected_action,
            'next_filename': filename_outcome,
            'value': reward,
        })
        print('Recorded episode {}/{}'.format(i, dataset_size))

    with open('{}.dataset'.format(DATASET_NAME), 'w') as fp:
        for e in examples:
            fp.write(json.dumps(e) + '\n')


if __name__ == '__main__':
    create_dataset()
