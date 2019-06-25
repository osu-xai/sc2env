import sc2env
import gym
import imutil
from sc2env.environments.super_four_towers import SuperFourTowersEnvironment


def generate_demo_video():
    env = SuperFourTowersEnvironment()
    state = env.reset()
    done = False
    print('Playing sample game with environment {}'.format(env))
    vid = imutil.Video('game-SuperFourTowers.mp4', framerate=8)

    # This function will run on each *rendered frame* of the game, including
    # frames in-between the agent's actions
    def callback(state, reward, done, info):
        minimap_ftr, screen_ftr, minimap_rgb, screen_rgb = state
        vid(screen_rgb, normalize=False)

    rewards = []
    while True:
        if done:
            break
        action = env.action_space.sample()
        state, reward, done, info = env.step(action, animation_callback=callback)
        rewards.append(reward)
        print('Timestep t={} took action {} got reward {}'.format(len(rewards), action, reward))
    vid.finish()
    print('Finished episode with {} total reward after {} timesteps'.format(sum(rewards), len(rewards)))


if __name__ == '__main__':
    generate_demo_video()
