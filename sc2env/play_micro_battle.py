import time
import json
import numpy as np
import os
from tqdm import tqdm

import imutil

from sc2env.q_learning_agent import ConvNetQLearningAgent, to_tensor
from sc2env.environments.micro_battle import MicroBattleEnvironment

MAX_STEPS = 1000


def train_agent(train_episodes=1000):
    # This environment teaches win/loss outcomes vs different enemies
    env = MicroBattleEnvironment(render=True)
    agent = ConvNetQLearningAgent(num_input_layers=env.layers(), num_actions=env.actions())
    demo_state = env.reset()

    # Train agent
    for i in range(train_episodes):
        video = (i % 10 == 0)
        play_episode(env, agent, i, video=video)
    print('Finished playing {} episodes'.format(train_episodes))


def play_episode(env, agent, episode_num=0, video=False):
    start_time = time.time()
    print('Starting episode {}...'.format(episode_num))
    state = env.reset()
    done = False
    cumulative_reward = 0
    if video:
        vid = imutil.Video('training_episode_{:04d}.mp4'.format(episode_num))
    for t in range(MAX_STEPS):
        if done:
            break
        action = agent.step(state)
        state, reward, done, info = env.step(action)
        caption = 't={} reward={}'.format(t, reward)
        if video:
            vid.write_frame(state[3], normalize=False)
        agent.update(reward)
        cumulative_reward += reward
    if video:
        vid.finish()
    print('Finished episode ({} actions) in {:.3f} sec total reward {}'.format(
        t, time.time() - start_time, cumulative_reward))
    return cumulative_reward


if __name__ == '__main__':
    train_agent()
