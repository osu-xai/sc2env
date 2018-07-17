# A template for an actual, intelligent agent
# Receives an observation (features and RGB) and produces an action
class RandomAgent():
    def __init__(self, action_space):
        self.action_space = action_space

    def step(self, obs):
        return self.action_space.sample()
