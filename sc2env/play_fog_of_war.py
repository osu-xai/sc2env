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
    - Deploy a Scout to reveal the current composition of the enemy's army
After 10 time steps, a game simulation rollout determines which army wins.
"""
def main():
    # Environment options:
    #   rollout_video=True: Generate .mp4 video of the battle at the end
    #   verbose=False: Print debug statements
    unique_id = int(time.time())
    video_filename = 'video_{}.mp4'.format(unique_id)
    env = fog_of_war.FogOfWarEnvironment(video_filename=video_filename)
    state = env.reset()
    done = False

    # Our agent takes actions to defeat the enemy
    agent = RandomAgent(env.action_space())


    while not done:
        # The buildable units are named Rock, Paper, and Scissors
        # 1: Build paper in reserves
        # 2: Build paper in front
        # 3: Build rock in reserves
        # 4: Build rock in front
        # 5: Build scissors in reserves
        # 6: Build scissors in front
        # 7: Scout to reveal the enemy's army
        action = agent.step(state)

        # Take an action and simulate the game for one time step (~10 seconds)
        state, reward, done, info = env.step(action)

        # The state is a tuple of:
        #   features_minimap: np array of features from the minimap view
        #   features_screen: np array of features from the camera view
        #   rgb_minimap: np array of an RGB pixel view of the minimap
        #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II
        features_minimap, features_screen, rgb_minimap, rgb_screen = state

        # Example code for visualizing the state
        filename = "output_frame_{}_{:05d}.jpg".format(unique_id, env.steps)
        caption = fog_of_war.action_to_name[action]
        caption = 't={}  R={}  Left: {}'.format(env.steps, reward, caption)
        top = imutil.show(rgb_minimap, resize_to=(800, 480), return_pixels=True, display=False, save=False)
        bottom = imutil.show(rgb_screen, resize_to=(800, 480), return_pixels=True, display=False, save=False)
        imutil.show(np.concatenate([top, bottom], axis=0), filename=filename, caption=caption)
    print('Finished game')


if __name__ == '__main__':
    main()
