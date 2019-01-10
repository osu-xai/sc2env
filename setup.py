from setuptools import setup, find_packages

setup(name='sc2env',
    version='0.1.12',
    description='Simple StarCraftII environments for reinforcement learning',
    long_description='A curriculum of custom-made StarCraftII environments for reinforcement learning.',
    author='Larry Neal',
    author_email='nealla@lwneal.com',
    packages=[
        'sc2env',
        'sc2env/environments',
        'sc2env/maps',
    ],
    package_data={
        'sc2env': ['maps/*.SC2Map'],
    },
    scripts=[
        'scripts/install_starcraft2',
    ],
    install_requires=[
        'numpy',
        'torch',
        'tqdm',
        'gym',
        'pysc2',
        'imutil',
    ],
)
