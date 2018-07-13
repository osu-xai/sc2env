import random

from dataset_recorder_agent import DatasetRecorderAgent
from video_recorder_agent import VideoRecorderAgent


class RandomAgent():
    def __init__(self, action_space):
        self.action_space = action_space

    def step(self, obs):
        return self.action_space.sample()
