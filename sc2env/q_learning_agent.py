import numpy as np
import torch
from torch import nn
from torch.optim import Adam
import torch.nn.functional as F

BUFFER_SIZE = 256

class ConvNetQLearningAgent():
    def __init__(self, num_input_layers, num_actions, epsilon=0.5, input_size=64):
        self.epsilon = epsilon
        self.num_actions = num_actions
        self.model = SimplePolicyNetwork(num_input_layers, num_actions)
        self.optimizer = Adam(self.model.parameters(), lr=.0001)
        self.replay_x = torch.zeros((BUFFER_SIZE, num_input_layers, input_size, input_size)).cuda()
        self.replay_a = torch.zeros((BUFFER_SIZE, 1), dtype=torch.long).cuda()
        self.replay_y = torch.zeros(BUFFER_SIZE).cuda()
        self.replay_buffer_mask = torch.zeros(BUFFER_SIZE).cuda()

    # obs: the state format returned from a SimpleTowersEnvironment
    def step(self, obs):
        self.model.eval()
        self.prev_obs = obs
        features_minimap, features_screen, rgb_minimap, rgb_screen = obs
        self.input_x = to_tensor(features_screen)
        self.estimated_rewards = self.model(self.input_x)
        if np.random.random() > self.epsilon:
            self.action_choice = np.random.randint(self.num_actions)
        else:
            self.action_choice = self.estimated_rewards.max(dim=1)[1].item()
        return self.action_choice

    def update(self, reward):
        self.model.train()
        self.model.zero_grad()

        # Add this reward to the replay buffer
        idx = np.random.randint(0, BUFFER_SIZE)
        self.replay_x[idx] = self.input_x
        self.replay_a[idx] = self.action_choice
        self.replay_y[idx] = reward
        self.replay_buffer_mask[idx] = 1

        # Perform regression with MSE loss to estimate reward
        pred_y = self.model(self.replay_x)
        gathered_y = torch.gather(pred_y, 1, self.replay_a)[:,0]
        error_per_sample = (gathered_y - self.replay_y)**2
        error = torch.mean(self.replay_buffer_mask * error_per_sample)
        print("Pred y: {:.02f} {:.02f} {:.02f} {:.02f}".format(
            pred_y[idx, 0], pred_y[idx, 1], pred_y[idx, 2], pred_y[idx, 3]))
        error.backward()
        self.optimizer.step()
        return float(error.data)


def to_tensor(x):
    x = torch.Tensor(x)
    x = x.unsqueeze(0)
    return x.cuda()


class SimplePolicyNetwork(nn.Module):
    def __init__(self, num_input_layers, num_outputs):
        super().__init__()
        self.conv1 = nn.Conv2d(num_input_layers, 32, kernel_size=5, stride=2)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 32, kernel_size=5, stride=2)
        self.bn2 = nn.BatchNorm2d(32)
        self.conv3 = nn.Conv2d(32, 32, kernel_size=5, stride=2)
        self.bn3 = nn.BatchNorm2d(32)
        self.conv4 = nn.Conv2d(32, 128, kernel_size=5, stride=2)
        self.bn4 = nn.BatchNorm2d(128)
        self.fc1 = nn.Linear(128, 128)
        self.bn5 = nn.BatchNorm1d(128)
        self.fc2 = nn.Linear(128, num_outputs)
        self.cuda()

    def forward(self, x):
        # Input shape: (batch, INPUT_LAYERS, 64, 64)
        x = self.conv1(x)
        x = self.bn1(x)
        x = F.leaky_relu(x, 0.2)
        x = self.conv2(x)
        x = self.bn2(x)
        x = F.leaky_relu(x, 0.2)
        x = self.conv3(x)
        x = self.bn3(x)
        x = F.leaky_relu(x, 0.2)
        x = self.conv4(x)
        x = self.bn4(x)
        x = F.leaky_relu(x, 0.2)
        # Output shape: (batch, num_outputs)
        x = x.view(x.size(0), -1)
        x = self.fc1(x)
        x = self.bn5(x)
        x = F.leaky_relu(x, 0.2)
        x = self.fc2(x)
        #x = 3 * torch.sigmoid(x)
        return x

