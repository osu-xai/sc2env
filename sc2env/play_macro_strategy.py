import sys
import imutil
import time
import numpy as np

from sc2env.random_agent import RandomAgent
from sc2env.environments import macro_strategy


"""
Macro Strategy environment
In this environment, each agent builds up units to attack the enemy
At each time step an agent may take one of the following actions:
    - Immediately produce units
    - Produce units linearly over time
    - Invest in resource gathering to produce more units per time step
    - Sabotage the opponent's resource gathering units
The game continues until one side or the other wins.
"""
def main(render=False):
    unique_id = int(time.time())
    if render:
        video_filename = 'video_{}.mp4'.format(unique_id)
        env = macro_strategy.MacroStrategyEnvironment(video_filename=video_filename, verbose=True)
    else:
        env = macro_strategy.MacroStrategyEnvironment(render=False, verbose=True)

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
        caption = macro_strategy.action_to_name[action]
        caption = 't={}  Reward={}  Action: {}'.format(env.steps, reward, caption)

        left = imutil.show(colorize(features_minimap[4]), resize_to=(256, 256), return_pixels=True, display=False, save=False)
        right = imutil.show(colorize(features_minimap[5], mode='nipy'), resize_to=(256, 256), return_pixels=True, display=False, save=False)
        pixels = np.concatenate([left, right], axis=1)
        if render:
            screenshot = imutil.show(rgb_screen, resize_to=(512, 288), return_pixels=True, display=False, save=False)
            pixels = np.concatenate([pixels, screenshot], axis=0)
        imutil.show(pixels, filename=filename, caption=caption)

    print('Finished game with final reward {}'.format(reward))


def colorize(pixels, mode='gnuplot'):
    from matplotlib import cm
    values = np.unique(pixels)
    vmin, vmax = min(values), max(values)
    new_pixels = np.zeros(pixels.shape + (3,))
    if mode == 'gnuplot':
        map = cm.gnuplot
    else:
        map = cm.nipy_spectral
    for v in values:
        val = (v - vmin) / (vmax - vmin)
        new_pixels[np.where(pixels == v)] = map(val)[:3]
    return new_pixels


if __name__ == '__main__':
    render = '--render' in sys.argv
    main(render=render)
