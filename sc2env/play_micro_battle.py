import json
import numpy as np
import os
from tqdm import tqdm

import imutil

from sc2env.q_learning_agent import ConvNetQLearningAgent, to_tensor
from sc2env.environments.micro_battle import MicroBattleEnvironment


def train_agent(train_episodes=100):
    # This environment teaches win/loss outcomes vs different enemies
    env = MicroBattleEnvironment()
    agent = ConvNetQLearningAgent(num_input_layers=env.layers(), num_actions=env.actions())
    demo_state = env.reset()

    # Train agent
    for i in range(train_episodes):
        play_episode(env, agent)
        # TODO: add this episode to a replay buffer
        # TODO: simultaneously, train a network on the replay buffer
    print('Finished playing {} episodes'.format(train_episodes))


def play_episode(env, agent):
    states, actions, rewards = [], [], []
    state = env.reset()
    done = False
    while not done:
        action = agent.step(state)
        states.append(state)
        state, reward, done, info = env.step(action)
        actions.append(action)
        rewards.append(reward)
    states.append(state)
    print('Finished episode in {} actions'.format(len(actions)))
    return states, actions, rewards


if __name__ == '__main__':
    train_agent()
