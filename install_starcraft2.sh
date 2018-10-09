#!/bin/bashwget -nc http://blzdistsc2-a.akamaihd.net/Linux/SC2.4.0.2.zipunzip -P iagreetotheeula SC2.4.0.2.zipwget -nc https://github.com/deepmind/pysc2/releases/download/v1.2/mini_games.zipwget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Melee.zipwget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Ladder2017Season3.zipwget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Ladder2017Season2.zipwget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Ladder2017Season1.zipunzip mini_games.zip -d StarCraftII/Maps/unzip -P iagreetotheeula Melee.zip -d StarCraftII/Maps/unzip -P iagreetotheeula Ladder2017Season3.zip -d StarCraftII/Maps/unzip -P iagreetotheeula Ladder2017Season2.zip -d StarCraftII/Maps/unzip -P iagreetotheeula Ladder2017Season1.zip -d StarCraftII/Maps/#!/bin/bash
wget -nc http://blzdistsc2-a.akamaihd.net/Linux/SC2.4.0.2.zip
unzip -P iagreetotheeula SC2.4.0.2.zip

wget -nc https://github.com/deepmind/pysc2/releases/download/v1.2/mini_games.zip

wget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Melee.zip
wget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Ladder2017Season3.zip
wget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Ladder2017Season2.zip
wget -nc http://blzdistsc2-a.akamaihd.net/MapPacks/Ladder2017Season1.zip

unzip mini_games.zip -d StarCraftII/Maps/
unzip -P iagreetotheeula Melee.zip -d StarCraftII/Maps/
unzip -P iagreetotheeula Ladder2017Season3.zip -d StarCraftII/Maps/
unzip -P iagreetotheeula Ladder2017Season2.zip -d StarCraftII/Maps/
unzip -P iagreetotheeula Ladder2017Season1.zip -d StarCraftII/Maps/

