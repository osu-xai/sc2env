## Starcraft RL

Simplified strategic StarCraft II environments for reinforcement learning.

![Screenshot of the Macro Strategy Task](https://github.com/osu-xai/sc2env/raw/master/static/screenshot_macro_strategy_task.jpg)

## Requirements

Built for Ubuntu 16.04 and Python 3.5 with PySC2 2.0 and StarCraft II 4.0 (build 59877) or higher.

Game screenshots require `libOSMesa` or a graphical version of StarCraft II (Windows or OSX).

## Installation

Just run:

````
    pip install sc2env
    install_starcraft2
    python -m sc2env.play_fog_of_war
````

Rendered game screenshots and feature maps should be generated as a set of .jpg files in the current directory.

## Environments

### Tactical Decision Making

![Animated screenshot of SimpleTactical-v0](https://github.com/osu-xai/sc2env/raw/master/static/simple_tactical.gif)

Action Space: Discrete(4). Attack one of four quadrants, each containing a group of enemy units.

Observation Space: Features, pixels, or structured unit list.

Reward: Multiple-reward signal representing damage dealt to enemy unit types, one value per enemy unit type.

Gym name: `SC2SimpleTactical-v0`


### Micro Battle

![Animated screenshot of MicroBattle-v0](https://github.com/osu-xai/sc2env/raw/master/static/micro_battle.gif)

Action Space: Discrete(2). Retreat backward, or attack-move forward.

Observation Space: Features and pixels.

Reward: Multiple-reward signal: Points of damage dealt to enemies,
points of damage taken by friendly units, value of enemies destroyed,
value of friendly units destroyed.

Gym name: `SC2MicroBattle-v0`


### Macro Strategy Task

Action Space: Discrete(6). Build a few units immediately or build more units over time. Two unit types are available (offensive and defensive).
Alternatively, invest in your economy (build SCV) or take a desparate defensive action (launch nuke).

Observation Space: Features and pixels.

Reward: Binary win/loss

Gym name: `SC2MacroStrategy-v0`


### Fog of War Task

![Animated screenshot of MicroBattle-v0](https://github.com/osu-xai/sc2env/raw/master/static/fog_of_war.gif)

Action Space: Discrete(8). Build two groups each consisting of one unit type: Rock, Paper, or Scissors.
Alternatively take a Scout action to reveal the composition of the opponent's army, or a Counterintelligence action to nullify an opponent's Scout.

Observation Space: Features and pixels.

Reward: Binary win/loss

Gym name: `SC2FogOfWar-v0`


## OpenAI Gym Integration

Each of the above environments can be initialized directly:

```
from sc2env.environments.micro_battle import MicroBattleEnvironment

env = MicroBattleEnvironment()
```

or through OpenAI Gym:

```
import gym
import sc2env

env = gym.make('SC2MicroBattle-v0')
```

After initialization, each environment can be used as follows:

```
state = env.reset()
done = False

while not done:
    action = env.action_space.sample()
    state, reward, done, info = env.step(action)
```

See `play_simple_tactical.py` for an example of how to format `state` as
input to a convolutional network.


### Generating XAI replays

To set up the environment so that you can generate replays of your own, ensure you have >= python 3.6.
Then install sc2env as above if you haven't already.
Then install abp using the instructions at https://github.com/osu-xai/abp.
Then, when ready to do replay, do this: git pull under both abp and sc2env to get the latest, then cd into abp and do:

````
cd ~/sc2/sc2env
git pull  // to get the latest
cd ~/sc2/abp
git pull  // to get the latest
// so that the example you will run under abp can find the sc2env code...
export PYTHONPATH=~/sc2/c2env

// then, run the one example (as of 1/16/2019) where we have our replay recorder running
python -m abp.trainer.task_runner -f tasks/four_towers_multi_unit/hra_recorded/v1 -t abp.examples.sc2env.four_towers_multi_unit.hra_recorded

// this runs the file abp/abp/examples/sc2env/four_towers_multi_unti/hra_recorded.py, which can be adjusted as follows:
//- how many training iterations - line 64
//- how many test iterations - line 133
// 
//  ...and some things are configured (hardcoded at moment) in sc2env/sc2env/environments/four_towers_multi_unit.py, such as 
//
//- image dimensions - line 33
//- step_mul  (the number of game cycles to run for every time step() is called on the environment ) - line 43
````

