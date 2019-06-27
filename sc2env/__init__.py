from gym.envs.registration import register

register(
        id='SC2SimpleTactical-v0',
        entry_point='sc2env.environments.simple_tactical:SimpleTacticalEnvironment',
)

register(
        id='SC2SuperFourTowers-v0',
        entry_point='sc2env.environments.super_four_towers:SuperFourTowersEnvironment',
)

register(
        id='SC2MicroBattle-v0',
        entry_point='sc2env.environments.micro_battle:MicroBattleEnvironment',
)

register(
        id='SC2MacroStrategy-v0',
        entry_point='sc2env.environments.macro_strategy:MacroStrategyEnvironment',
)

register(
        id='SC2FogOfWar-v0',
        entry_point='sc2env.environments.fog_of_war:FogOfWarEnvironment',
)

register(
        id='SC2StarIntruders-v0',
        entry_point='sc2env.environments.star_intruders:StarIntrudersEnvironment',
)

register(
        id='SC2StarIntrudersBox-v0',
        entry_point='sc2env.environments.star_intruders:StarIntrudersBox',
)
