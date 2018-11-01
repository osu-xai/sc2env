import json
import numpy as np
import os
from tqdm import tqdm

import imutil
from logutil import TimeSeries

from sc2env.profiling import Timer
from sc2env.q_learning_agent import ConvNetQLearningAgent
from sc2env.environments.simple_towers import SimpleTowersEnvironment


def train_agent(train_episodes=1000, epochs=10):
    # This environment teaches win/loss outcomes vs different enemies
    agent = ConvNetQLearningAgent(num_input_layers=18, num_actions=4)

    # Logs time-series data to Tensorflow, prints formatted output
    ts = TimeSeries('Training', train_episodes*epochs)

    # Train and evaluate
    for epoch in range(epochs):
        env = SimpleTowersEnvironment()
        for i in range(train_episodes):
            # Each episode consists of a "before", a single action, and an "after"
            # The state is a tuple of:
            #   features_minimap: np array of features from the minimap view
            #   features_screen: np array of features from the camera view
            #   rgb_minimap: np array of an RGB pixel view of the minimap
            #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II
            state = env.reset()

            # Select one of four actions
            selected_action = agent.step(state)

            # Take the action and simulate the game for one time step (~10 seconds)
            state, reward, done, info = env.step(selected_action)

            agent.update(reward)
            ts.collect('Reward', reward)
            ts.print_every(2)
        print(ts)

        print('Evaluating:')
        state = env.reset()
        selected_action = agent.step(state)
        estimates = agent.model(agent.to_tensor(state[1]))[0]
        caption = 'Est. R: {}'.format(estimates)
        imutil.show(state[3], filename="eval_epoch_{:04d}.png".format(epoch),
                    caption=caption, resize_to=(512,512), font_size=10)
    print('Finished {} epochs'.format(epochs))



if __name__ == '__main__':
    train_agent()
