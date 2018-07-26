#!/usr/bin/env python

from setuptools import setup

setup(name='sc2util',
    version='0.1.0',
    description='Tools for reinforcement learning with Starcraft II',
    author='Larry Neal',
    author_email='nealla@lwneal.com',
    packages=[
        'sc2util',
    ],
    install_requires=[
        'pysc2',
        'numpy',
        'Pillow',
    ],
)
