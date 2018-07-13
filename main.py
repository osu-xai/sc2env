import random

import imutil
from imutil import VideoMaker
from rts_environment import RTSEnvironment
from random_agent import RandomAgent


def main():
    env = RTSEnvironment()
    agent = RandomAgent(env.action_space())
    state = env.reset()

    try:
        while True:
            action = agent.step(state)
            state, reward, done, info = env.step(action)
            feature_minimap, feature_screen, rgb_minimap, rgb_screen = state
            if done:
                break
    finally:
        del env


if __name__ == '__main__':
    main()
