import imutil
from tqdm import tqdm
from four_choices_environment import FourChoicesEnvironment
from random_agent import RandomAgent


def create_dataset(dataset_size=1000):
    # This environment teaches win/loss outcomes vs different enemies
    env = FourChoicesEnvironment()
    agent = RandomAgent(env.action_space())

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
        b_prefix = 'output/{:05d}_before_'.format(i)
        imutil.show(initial_state[0], filename=b_prefix + 'feature_map.png')
        imutil.show(initial_state[1], filename=b_prefix + 'feature_screen.png')
        imutil.show(initial_state[2], filename=b_prefix + 'rgb_map.png')
        imutil.show(initial_state[3], filename=b_prefix + 'rgb_screen.png')

        a_prefix = 'output/{:05d}_after_{:02d}_'.format(i, selected_action)
        imutil.show(outcome_state[0], filename=a_prefix + 'feature_map.png')
        imutil.show(outcome_state[1], filename=a_prefix + 'feature_screen.png')
        imutil.show(outcome_state[2], filename=a_prefix + 'rgb_map.png')
        imutil.show(outcome_state[3], filename=a_prefix + 'rgb_screen.png')

        print('Recorded episode {}/{}'.format(i, dataset_size))


if __name__ == '__main__':
    create_dataset()
