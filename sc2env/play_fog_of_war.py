import sys
import imutil
import time
import numpy as np

from random_agent import RandomAgent
from environments import fog_of_war


"""
Fog of War environment
In this environment, each agent builds two army groups: the front-line group and the reserve.
Each group consists of one of three unit compositions: Rock units, Paper units, and Scissors
At each time step the agent may take one of the following actions:
    - Add more units to a group, increasing its size
    - Switch a group to a different unit type (deleting the existing units)
    - Scan to reveal the current composition of the enemy's army
    - Counterintelligence to nullify enemy scans for the next 3 time steps
After 10 time steps, a game simulation rollout determines which army wins.
"""
def main(render=False):
    unique_id = int(time.time())
    if render:
        video_filename = 'video_{}.mp4'.format(unique_id)
        env = fog_of_war.FogOfWarEnvironment(video_filename=video_filename, verbose=True)
    else:
        env = fog_of_war.FogOfWarEnvironment(render=False, verbose=True)

    state = env.reset()
    done = False

    agent = RandomAgent(env.action_space())

    while not done:
        # Our agent takes the state as input and selects actions to maximize reward
        action = agent.step(state)

        # Take an action and simulate the game for one time step (~5 seconds)
        state, reward, done, info = env.step(action)

        # The state is a tuple of:
        #   features_minimap: np array of features from the minimap view
        #   features_screen: np array of features from the camera view
        #   rgb_minimap: np array of an RGB pixel view of the minimap (if render=True)
        #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II (if render=True)
        features_minimap, features_screen, rgb_minimap, rgb_screen = state

        # Example code for visualizing the state
        filename = "output_frame_{}_{:05d}.jpg".format(unique_id, env.steps)
        caption = fog_of_war.action_to_name[action]
        caption = 't={}  Reward={}  Action: {}'.format(env.steps, reward, caption)
        if render:
            top = imutil.show(rgb_minimap, resize_to=(800, 480), return_pixels=True, display=False, save=False)
            bottom = imutil.show(rgb_screen, resize_to=(800, 480), return_pixels=True, display=False, save=False)
            imutil.show(np.concatenate([top, bottom], axis=0), filename=filename, caption=caption)
        else:
            top = imutil.show(features_minimap[5], resize_to=(256, 256), return_pixels=True, display=False, save=False)
            bottom = imutil.show(features_screen[5], resize_to=(256, 256), return_pixels=True, display=False, save=False)
            imutil.show(np.concatenate([top, bottom], axis=1), filename=filename, caption=caption)

    print('Finished game with final reward {}'.format(reward))


if __name__ == '__main__':
    render = '--render' in sys.argv
    main(render=render)
