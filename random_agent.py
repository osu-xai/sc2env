import random

import imutil
from imutil import VideoMaker
from rts_environment import RTSEnvironment


class DumbAgent():
    def __init__(self):
        pass

    def step(self, obs):
        return random.choice([0, 1, 2, 3])


def main():
    env = RTSEnvironment()
    agent = DumbAgent()
    state = env.reset()

    vid_rgb_screen = VideoMaker('rgb_screen')
    vid_rgb_map = VideoMaker('rgb_minimap')
    vid_feat_screen = VideoMaker('feature_screen')
    vid_feat_map = VideoMaker('feature_minimap')
    try:
        while True:
            action = agent.step(state)
            state, reward, done, info = env.step(action)
            feature_minimap, feature_screen, rgb_minimap, rgb_screen = state

            vid_rgb_map.write_frame(rgb_minimap)
            vid_rgb_screen.write_frame(rgb_screen)
            vid_feat_map.write_frame(feature_minimap)
            vid_feat_screen.write_frame(feature_screen)
            if done:
                break
    finally:
        del env
        vid_rgb_screen.finish()
        vid_rgb_map.finish()
        vid_feat_screen.finish()
        vid_feat_map.finish()


if __name__ == '__main__':
    main()
