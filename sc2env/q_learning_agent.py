import torch
from torch import nn
from torch.optim import Adam
import torch.nn.functional as F
from representation import expand_pysc2_to_neural_input


class ConvNetQLearningAgent():
    def __init__(self, num_input_layers, action_space):
        self.action_space = action_space
        self.model = SimplePolicyNetwork(num_input_layers, action_space.n)
        self.optimizer = Adam(self.model.parameters())

    # obs: the state format returned from a SimpleTowersEnvironment
    def step(self, obs):
        self.prev_obs = obs
        feature_map = obs[1]
        x = torch.Tensor(expand_pysc2_to_neural_input(feature_map))
        self.estimated_reward = self.model(x.unsqueeze(0))
        self.action_choice = self.action_space.sample()
        return self.action_choice

    def update(self, reward):
        est_reward = self.estimated_reward[:, self.action_choice]
        error = torch.mean((est_reward - reward) ** 2)
        error.backward()
        self.optimizer.step()
        return float(error.data)


class SimplePolicyNetwork(nn.Module):
    def __init__(self, num_input_layers, num_outputs):
        super().__init__()
        self.conv1 = nn.Conv2d(num_input_layers, 16, kernel_size=5, stride=2)
        self.bn1 = nn.BatchNorm2d(16)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=5, stride=2)
        self.bn2 = nn.BatchNorm2d(32)
        self.conv3 = nn.Conv2d(32, 32, kernel_size=5, stride=2)
        self.bn3 = nn.BatchNorm2d(32)
        self.conv4 = nn.Conv2d(32, 128, kernel_size=5, stride=2)
        self.fc1 = nn.Linear(128, num_outputs)

    def forward(self, x):
        # Input shape: (batch, INPUT_LAYERS, 64, 64)
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        x = F.relu(self.conv4(x))
        # Output shape: (batch, num_outputs)
        return self.fc1(x.view(x.size(0), -1))

