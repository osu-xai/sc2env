import os
import random
import numpy as np
from pysc2_util import register_map, unpack_timestep
from pysc2.env import sc2_env
from pysc2.lib import actions

MAP_NAME = 'MacroStrategy'
MAP_SIZE = 64
RGB_SCREEN_SIZE = 256


action_to_ability_id = {
    1: 3771,  # Spawn Marines
    2: 3773,  # Spawn Immortals
    3: 3775,  # Spawn Ultralisks
    4: 3777,  # Spawn SCV
    5: 3779,  # Reserve Marines
    6: 3781,  # Reserve Immortals
    7: 3783,  # Reserve Ultralisks
}

# Squelch pysc2 complaints about unknown ids
#for ability_id in action_to_ability_id.values():
#    actions.ABILITY_IDS[ability_id] = set()


class MacroStrategyEnvironment():
    def __init__(self):
        self.sc2env = make_sc2env()

    def reset(self):
        self.noop()
        state, reward, done, info = unpack_timestep(self.last_timestep)
        return state

    # Action space:
    # 0: No-op
    # 1: Build Marines
    # 2: Build Immortals
    # 3: Build Ultralisk
    # 4: Build SCV (to gather resources)
    # 5: Add Marines to reserve
    # 6: Add Immortals to reserve
    # 7: Add Ultralisks to reserve
    def action_space(self):
        from gym.spaces.discrete import Discrete
        return Discrete(4)

    # Step: Take an action and play the game out 10 seconds
    def step(self, action_player1, action_player2=None):
        # Default: Play against a random agent
        if action_player2 is None:
            action_player2 = self.action_space().sample()

        if action_player1 > 0:
            player1_ability_id = action_to_ability_id[action_player1]
            self.use_custom_ability(player1_ability_id, 1)
        if action_player2:
            player2_ability_id = action_to_ability_id[action_player2]
            self.use_custom_ability(player2_ability_id, 2)

        # Wait for a while
        self.noop()

        return unpack_timestep(self.last_timestep)

    def noop(self):
        sc2_action = actions.FUNCTIONS.no_op()
        self.last_timestep = self.sc2env.step([sc2_action])[0]

    def can_attack(self):
        available_actions = self.last_timestep.observation.available_actions
        return actions.FUNCTIONS.Attack_minimap.id in available_actions

    def use_custom_ability(self, ability_id, player_id=1):
        from s2clientprotocol import sc2api_pb2
        from s2clientprotocol import common_pb2
        from s2clientprotocol import spatial_pb2

        def get_action_spatial(ability_id):
            target_point = common_pb2.PointI()
            target_point.x = 0
            target_point.y = 0

            action_spatial_unit_command = spatial_pb2.ActionSpatialUnitCommand(target_minimap_coord=target_point)
            action_spatial_unit_command.ability_id = ability_id

            action_spatial = spatial_pb2.ActionSpatial(unit_command=action_spatial_unit_command)
            action = sc2api_pb2.Action(action_feature_layer=action_spatial)
            return action

        player_action = get_action_spatial(ability_id)
        request_action = sc2api_pb2.RequestAction(actions=[player_action])
        request = sc2api_pb2.Request(action=request_action)

        # Bypass pysc2 and send the proto directly
        client = self.sc2env._controllers[player_id - 1]._client
        client.send_req(request)


# Create the low-level SC2Env object, which we wrap with
#  a high level Gym-style environment
def make_sc2env():
    env_args = {
        'agent_interface_format': sc2_env.AgentInterfaceFormat(
            feature_dimensions=sc2_env.Dimensions(
                screen=(MAP_SIZE, MAP_SIZE),
                minimap=(MAP_SIZE, MAP_SIZE)
            ),
            rgb_dimensions=sc2_env.Dimensions(
                screen=(RGB_SCREEN_SIZE, RGB_SCREEN_SIZE),
                minimap=(RGB_SCREEN_SIZE, RGB_SCREEN_SIZE),
            ),
            action_space=actions.ActionSpace.FEATURES,
        ),
        'map_name': MAP_NAME,
        'step_mul': 17 * 5,  # 17 is ~1 action per second
        'players': [sc2_env.Agent(sc2_env.Race.terran), sc2_env.Agent(sc2_env.Race.terran)],
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'], players=2)
    return sc2_env.SC2Env(**env_args)

