## Starcraft RL

Simplified strategic StarCraft II environments for reinforcement learning.

![Screenshot of the Macro Strategy Task](https://github.com/lwneal/starcraft-rl/raw/master/screenshot_macro_strategy_task.jpg)

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

Action Space: Discrete(4). Attack one of four quadrants, each containing a group of enemy units.

Observation Space: Features, pixels, or structured unit list.

Reward: Multiple-reward signal representing damage dealt to enemy unit types, one value per enemy unit type.

### Macro Strategy Task

Action Space: Discrete(6). Build a few units immediately or build more units over time. Two unit types are available (offensive and defensive).
Alternatively, invest in your economy (build SCV) or take a desparate defensive action (launch nuke).

Observation Space: Features and pixels.

Reward: Binary win/loss


### Fog of War Task

Action Space: Discrete(8). Build two groups each consisting of one unit type: Rock, Paper, or Scissors.
Alternatively take a Scout action to reveal the composition of the opponent's army, or a Counterintelligence action to nullify an opponent's Scout.

Observation Space: Features and pixels.

Reward: Binary win/loss
