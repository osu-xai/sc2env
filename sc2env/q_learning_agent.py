import numpy as np
import torch
from torch import nn
from torch.optim import Adam
import torch.nn.functional as F

from sc2env.representation import expand_pysc2_to_neural_input


class ConvNetQLearningAgent():
    def __init__(self, num_input_layers, num_actions, epsilon=0.2):
        self.epsilon = epsilon
        self.num_actions = num_actions
        self.model = SimplePolicyNetwork(num_input_layers, num_actions)
        self.optimizer = Adam(self.model.parameters())

    # obs: the state format returned from a SimpleTowersEnvironment
    def step(self, obs):
        self.model.eval()
        self.prev_obs = obs
        features_minimap, features_screen, rgb_minimap, rgb_screen = obs
        x = self.to_tensor(features_screen)
        self.estimated_reward = self.model(x)
        if np.random.random() > self.epsilon:
            self.action_choice = self.estimated_reward.max(dim=1)[1].item()
        else:
            self.action_choice = np.random.randint(self.num_actions)
        return self.action_choice

    def to_tensor(self, features_screen):
        x = expand_pysc2_to_neural_input(features_screen)
        x = torch.Tensor(x)
        x = x.unsqueeze(0)
        return x

    def update(self, reward):
        self.model.train()
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
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = F.relu(self.conv4(x))
        # Output shape: (batch, num_outputs)
        return self.fc1(x.view(x.size(0), -1))

