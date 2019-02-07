import sc2env
import gym
from imutil import Video

env_names = [
    'SC2SimpleTactical-v0',
    'SC2MicroBattle-v0',
    'SC2FogOfWar-v0',
    'SC2MacroStrategy-v0',
]


def generate_demo_video(env_name):
    env = gym.make(env_name)
    state = env.reset()
    done = False
    vid = Video('game-{}.mp4'.format(env_name), framerate=2)
    rewards = []
    print('Playing sample game with environment {}'.format(env_name))
    while True:
        minimap_ftr, screen_ftr, minimap_rgb, screen_rgb = state
        vid(screen_rgb, normalize=False)
        if done:
            break
        action = env.action_space.sample()
        state, reward, done, info = env.step(action)
        rewards.append(reward)
        print('Timestep t={} took action {} got reward {}'.format(len(rewards), action, reward))
    vid.finish()
    print('Finished episode with {} total reward after {} timesteps'.format(
        sum(rewards), len(rewards)))


if __name__ == '__main__':
    for env_name in env_names:
        generate_demo_video(env_name)
