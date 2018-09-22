## Starcraft RL

Simplified strategic StarCraft II environments for reinforcement learning.

![Screenshot of the Macro Strategy Task](https://github.com/lwneal/starcraft-rl/raw/master/screenshot_macro_strategy_task.jpg)

## Requirements

Built for Ubuntu 16.04 and Python 3.5 with PySC2 2.0 and StarCraft II 4.0 (build 59877) or higher.

Game screenshots require `libOSMesa` or a graphical version of StarCraft II (Windows or OSX).

## Installation

Follow the [Blizzard documentation](https://github.com/Blizzard/s2client-proto#downloads)
to download and install the Linux version of StarCraft II

Ensure StarCraftII is installed at `~/StarCraftII`. Then run:

````
    pip install -r requirements.txt
    python sc2env/play_fog_of_war.py
````

Rendered game screenshots and feature maps should be generated as a set of .jpg files in the current directory.
