import time
import json
import numpy as np
import os
from tqdm import tqdm

import imutil

from sc2env.q_learning_agent import ConvNetQLearningAgent, to_tensor
from sc2env.environments.micro_battle import MicroBattleEnvironment

MAX_STEPS = 1000


def train_agent(train_episodes=10):
    # This environment teaches win/loss outcomes vs different enemies
    env = MicroBattleEnvironment(render=True)
    agent = ConvNetQLearningAgent(num_input_layers=env.layers(), num_actions=env.actions())
    demo_state = env.reset()

    # Train agent
    for i in range(train_episodes):
        states, actions, rewards = play_episode(env, agent, i)
        # TODO: add this episode to a replay buffer
        # TODO: simultaneously, train a network on the replay buffer
    print('Finished playing {} episodes'.format(train_episodes))


def play_episode(env, agent, episode_num=0):
    start_time = time.time()
    print('Starting episode {}...'.format(episode_num))
    states, actions, rewards = [], [], []
    state = env.reset()
    done = False
    vid = imutil.Video('training_episode_{:04d}.mp4'.format(episode_num))
    for t in range(MAX_STEPS):
        if done:
            break
        action = agent.step(state)
        states.append(state)
        state, reward, done, info = env.step(action)
        actions.append(action)
        rewards.append(reward)
        caption = 't={} reward={}'.format(t, reward)
        vid.write_frame(state[3], normalize=False)
    vid.finish()
    states.append(state)
    print('Finished episode ({} actions) in {:.3f} sec'.format(
        len(actions), time.time() - start_time))
    return states, actions, rewards


if __name__ == '__main__':
    train_agent()
