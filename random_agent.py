import random

from dataset_recorder_agent import DatasetRecorderAgent
from video_recorder_agent import VideoRecorderAgent


class RandomAgent(DatasetRecorderAgent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def step(self, obs):
        super().step(obs)
        action = random.choice([0, 1, 2, 3])
        return action
