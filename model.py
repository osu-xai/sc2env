import numpy as np
import torch
from torch import nn
import torch.nn.functional as F
from torch.autograd import Variable

from spectral_normalization import SpectralNorm

channels = 18
leak = 0.1


class Generator(nn.Module):
    def __init__(self, z_dim):
        super(Generator, self).__init__()
        self.z_dim = z_dim

        self.conv1 = nn.ConvTranspose2d(z_dim, 512, 4, stride=1) # 4x4
        self.bn1 = nn.BatchNorm2d(512)
        self.conv2 = nn.ConvTranspose2d(512, 256, 4, stride=2, padding=(0,0)) # 10
        self.bn2 = nn.BatchNorm2d(256)
        self.conv3 = nn.ConvTranspose2d(256, 128, 4, stride=2, padding=(1,1)) # 20
        self.bn3 = nn.BatchNorm2d(128)
        self.conv4 = nn.ConvTranspose2d(128, 64, 4, stride=2, padding=(1,1)) # 40

        self.conv_to_rgb = nn.ConvTranspose2d(64, channels, 3, stride=1, padding=(1,1))

    def forward(self, z):
        batch_size = z.shape[0]
        x = z.view(-1, self.z_dim, 1, 1)

        x = self.conv1(x)
        x = self.bn1(x)
        x = F.relu(x)

        x = self.conv2(x)
        x = self.bn2(x)
        x = F.relu(x)

        x = self.conv3(x)
        x = self.bn3(x)
        x = F.relu(x)

        x = self.conv4(x)
        x = F.relu(x)

        x = self.conv_to_rgb(x)
        x = F.sigmoid(x)
        return x


class Discriminator(nn.Module):
    def __init__(self):
        super(Discriminator, self).__init__()

        # Input: 40x40x6
        self.conv1 = SpectralNorm(nn.Conv2d(channels, 64, 3, stride=1, padding=(1,1)))
        # 40 x 40 x 64
        self.conv2 = SpectralNorm(nn.Conv2d(64, 128, 4, stride=2, padding=(1,1)))
        # 20 x 20 x 128
        self.conv3 = SpectralNorm(nn.Conv2d(128, 256, 4, stride=2, padding=(1,1)))
        # 10 x 10 x 256
        self.conv4 = SpectralNorm(nn.Conv2d(256, 256, 4, stride=2, padding=(1,1)))
        # 5 x 5 x 256
        self.conv5 = SpectralNorm(nn.Conv2d(256, 256, 3, stride=1, padding=(0,0)))
        # 3 x 3 x 256
        self.fc = SpectralNorm(nn.Linear(3 * 3 * 256, 1))

    def forward(self, x):
        x = nn.LeakyReLU(leak)(self.conv1(x))
        x = nn.LeakyReLU(leak)(self.conv2(x))
        x = nn.LeakyReLU(leak)(self.conv3(x))
        x = nn.LeakyReLU(leak)(self.conv4(x))
        x = nn.LeakyReLU(leak)(self.conv5(x))
        return self.fc(x.view(-1, 3 * 3 * 256))


class Encoder(nn.Module):
    def __init__(self, latent_size):
        super(Encoder, self).__init__()
        self.latent_size = latent_size
        # Input: 40x40x6
        self.conv1 = SpectralNorm(nn.Conv2d(channels, 64, 3, stride=1, padding=(1,1)))
        # 40 x 40 x 64
        self.conv2 = SpectralNorm(nn.Conv2d(64, 128, 4, stride=2, padding=(1,1)))
        # 20 x 20 x 128
        self.conv3 = SpectralNorm(nn.Conv2d(128, 256, 4, stride=2, padding=(1,1)))
        # 10 x 10 x 256
        self.conv4 = SpectralNorm(nn.Conv2d(256, 256, 4, stride=2, padding=(1,1)))
        # 5 x 5 x 256
        self.conv5 = SpectralNorm(nn.Conv2d(256, 256, 3, stride=1, padding=(0,0)))
        # 3 x 3 x 256
        self.fc = SpectralNorm(nn.Linear(3 * 3 * 256, latent_size))

    def forward(self, x):
        x = nn.LeakyReLU(leak)(self.conv1(x))
        x = nn.LeakyReLU(leak)(self.conv2(x))
        x = nn.LeakyReLU(leak)(self.conv3(x))
        x = nn.LeakyReLU(leak)(self.conv4(x))
        x = nn.LeakyReLU(leak)(self.conv5(x))
        x = self.fc(x.view(-1, 3 * 3 * 256))

        # L2 ball normalization
        eps = .0001
        norm = torch.norm(x, p=2, dim=1)
        x = x / (norm.expand(1, -1).t() + eps)

        return x


class ValueEstimator(nn.Module):
    def __init__(self, latent_size, num_actions=4):
        super(ValueEstimator, self).__init__()
        self.latent_size = latent_size
        self.fc1 = nn.Linear(latent_size, 256)
        self.fc2 = nn.Linear(256, num_actions)

    def forward(self, x):
        x = nn.LeakyReLU(leak)(self.fc1(x))
        x = self.fc2(x)
        return x


class Predictor(nn.Module):
    def __init__(self, latent_size, num_actions=4):
        super(Predictor, self).__init__()
        self.latent_size = latent_size
        self.num_actions = num_actions
        self.fc1 = nn.Linear(latent_size, 256)
        self.fc2 = nn.Linear(256, num_actions*latent_size)

    def forward(self, x):
        x = nn.LeakyReLU(leak)(self.fc1(x))
        x = self.fc2(x)
        # Resize x into one predicted next state per action
        x = x.view(-1, self.num_actions, self.latent_size)
        return x

