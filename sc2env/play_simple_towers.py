import json
import numpy as np
import os
from tqdm import tqdm

import imutil

from sc2env.q_learning_agent import ConvNetQLearningAgent, to_tensor
from sc2env.environments.simple_towers import SimpleTowersEnvironment


def train_agent(train_episodes=1000, epochs=100):
    # This environment teaches win/loss outcomes vs different enemies
    env = SimpleTowersEnvironment()
    agent = ConvNetQLearningAgent(num_input_layers=env.layers(), num_actions=env.actions())
    demo_state = env.reset()

    for epoch in range(epochs):
        # Train agent
        env = SimpleTowersEnvironment()
        cumulative_reward = 0
        cumulative_loss = 0
        for i in range(train_episodes):
            # Each episode consists of a "before", a single action, and an "after"
            # The state is a tuple of:
            #   features_minimap: np array of features from the minimap view
            #   features_screen: np array of features from the camera view
            #   rgb_minimap: np array of an RGB pixel view of the minimap
            #   rgb_screen: np array of RGB pixel rendered frame of Starcraft II
            initial_state = env.reset()

            # Select one of four actions
            selected_action = agent.step(initial_state)

            # Take the action and simulate the game for one time step (~10 seconds)
            result_state, reward, done, info = env.step(selected_action)

            loss = agent.update(reward)
            cumulative_loss += loss
            cumulative_reward += reward
            avg_reward = cumulative_reward / (i + 1)
            avg_loss = cumulative_loss / (i + 1)
            print('Step {}/{} average reward {:.3f} avg. loss {:.3f}'.format(
                i, train_episodes, avg_reward, avg_loss))
        agent.epsilon **= 0.9
        print('Updating epsilon to {}'.format(agent.epsilon))

        # Evaluate agent
        print('Evaluating:')
        selected_action = agent.step(demo_state)
        estimates = agent.model(to_tensor(demo_state[1]))[0].cpu().data.numpy()
        caption = 'NW {:.02f},  NE {:.02f},  SE {:.02f},  SW {:.02f}'.format(
            estimates[0], estimates[1], estimates[2], estimates[3])
        imutil.show(demo_state[3], filename="eval_epoch_{:04d}.png".format(epoch),
                    caption=caption, resize_to=(512,512), font_size=10)
    print('Finished {} epochs'.format(epochs))



if __name__ == '__main__':
    train_agent()
