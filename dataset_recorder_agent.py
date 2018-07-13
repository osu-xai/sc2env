import numpy as np
import imutil


class DatasetRecorderAgent():
    def __init__(self, action_space):
        self.action_space = action_space

    def step(self, state):
        feature_minimap, feature_screen, rgb_minimap, rgb_screen = state
        img = np.concatenate([rgb_screen, rgb_minimap], axis=1)
        imutil.show(img, save=False)
        return self.action_space.sample()
