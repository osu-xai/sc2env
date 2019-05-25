import sc2env
import gym
import imutil
import time
import numpy as np
from sc2env.environments.star_intruders import StarIntrudersEnvironment


def generate_demo_video():
    env = StarIntrudersEnvironment(screen_size=512)
    state = env.reset()
    done = False
    print('Playing sample game with environment {}'.format(env))
    filename = 'game-StarIntruders-{}.mp4'.format(int(time.time()))
    vid = imutil.Video(filename, framerate=8)

    rewards = []
    action = env.action_space.sample()
    for t in range(200):
        if done:
            print('Finished episode with {} total reward after {} timesteps'.format(sum(rewards), len(rewards)))
            rewards = []
            state = env.reset()
        if np.random.random() < .2:
            action = env.action_space.sample()
        state, reward, done, info = env.step(action)
        minimap_ftr, screen_ftr, minimap_rgb, screen_rgb = state
        caption = 't={} Reward: {:.2f}'.format(t, reward)
        vid(screen_rgb, normalize=False, caption=caption, resize_to=(512,512))
        rewards.append(reward)
        print('Timestep t={} took action {} got reward {}'.format(len(rewards), action, reward))
    vid.finish()
    print('Finished episode with {} total reward after {} timesteps'.format(sum(rewards), len(rewards)))


if __name__ == '__main__':
    generate_demo_video()
