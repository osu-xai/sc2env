import json
import numpy as np
import os
from tqdm import tqdm
from logutil import TimeSeries

from q_learning_agent import ConvNetQLearningAgent
from environments.simple_towers import SimpleTowersEnvironment


def train_agent(episodes=10000):
    # This environment teaches win/loss outcomes vs different enemies
    print('Initializing environment...')
    env = SimpleTowersEnvironment()
    print('Initializing agent...')
    agent = ConvNetQLearningAgent(num_input_layers=18, action_space=env.action_space())

    ts = TimeSeries('Training', episodes)
    for i in range(episodes):
        # Each episode consists of a "before", a single action, and an "after"
        state = env.reset()

        # The state is a tuple of:
        #   features_minimap: np array of features from the minimap view
        #   features_screen: np array of features from the camera view
        #   rgb_minimap: np array of an RGB pixel view of the minimap
        #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II

        # Select one of four actions
        selected_action = agent.step(state)

        # Take the action and simulate the game for one time step (~10 seconds)
        state, reward, done, info = env.step(selected_action)

        agent.update(reward)
        ts.collect('Reward', reward)
        ts.print_every(2)
    print(ts)


if __name__ == '__main__':
    train_agent()
