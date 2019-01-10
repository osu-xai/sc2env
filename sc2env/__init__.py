from gym.envs.registration import register

register(
        id='SC2SimpleTowers-v0',
        entry_point='sc2env.environments.simple_towers:SimpleTowersEnvironment',
)

