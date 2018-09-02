import time
import os
import random
import numpy as np
from pysc2_util import register_map, unpack_timestep
from pysc2.env import sc2_env
from pysc2.lib import actions

MAP_NAME = 'MacroStrategy'
MAP_SIZE = 64
RGB_SCREEN_WIDTH = 400
RGB_SCREEN_HEIGHT = 240


action_to_ability_id = {
    1: 3771,  # Spawn Marines
    2: 3775,  # Spawn Immortals
    3: 3779,  # Spawn Ultralisk
    4: 3783,  # Spawn SCV
    5: 3773,  # Secondary Button Marines
    6: 3777,  # Secondary Button Immortals
    7: 3781,  # Secondary Button Ultralisk
}
action_to_name = {
    0: "No-Op",
    1: "Invest in Marines",
    2: "Invest in Immortals",
    3: "Invest in Ultralisk",
    4: "Build SCV",
    5: "Build Marines",
    6: "Build Immortals",
    7: "Build Ultralisk",
}

# Squelch pysc2 complaints about unknown ids
#for ability_id in action_to_ability_id.values():
#    actions.ABILITY_IDS[ability_id] = set()


class MacroStrategyEnvironment():
    def __init__(self):
        self.sc2env = make_sc2env()

    def reset(self):
        self.do_step()
        self.steps = 0
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
        return Discrete(8)

    # Step: Take an action and play the game out 10 seconds
    def step(self, action_player1, action_player2=None):
        print('Running step()')
        self.steps += 1

        if action_player1 > 0:
            player1_ability_id = action_to_ability_id[action_player1]
            self.use_custom_ability(player1_ability_id, 1)
        if action_player2 > 0:
            player2_ability_id = action_to_ability_id[action_player2]
            self.use_custom_ability(player2_ability_id, 2)

        # Step forward to synchronize clients
        self.sc2env._controllers[0].step(count=1)
        self.sc2env._controllers[1].step(count=1)
        self.sc2env._controllers[0].observe()
        self.sc2env._controllers[1].observe()

        self.do_step()
        return unpack_timestep(self.last_timestep)

    def do_step(self):
        from pysc2.lib.actions import FUNCTIONS
        #doop = actions.FunctionCall(FUNCTIONS[549], [])
        noop = FUNCTIONS.no_op()
        action_list = [noop, noop]
        start_time = time.time()
        self.last_timestep, enemy_timestep = self.sc2env.step(action_list)
        print('Called sc2env.step() in {:.02f} sec'.format(time.time() - start_time))

        #start_time = time.time()
        #self.last_timestep, enemy_timestep = self.sc2env._step()
        #print('Called sc2env._step() in {:.02f} sec'.format(time.time() - start_time))

        # Step forward
        #for player_id in [1, 2]:
        #    self.sc2env._controllers[player_id - 1].step()
        # Observe player 1
        #self.last_timestep = self.sc2env._controllers[0].observe()


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
        print('Calling client.send_req for player_id {}'.format(player_id))
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
                screen=(RGB_SCREEN_WIDTH, RGB_SCREEN_HEIGHT),
                minimap=(RGB_SCREEN_WIDTH, RGB_SCREEN_HEIGHT),
            ),
            action_space=actions.ActionSpace.FEATURES,
        ),
        'map_name': MAP_NAME,
        'step_mul': 17 * 10,  # 17 is ~1 action per second
        'players': [sc2_env.Agent(sc2_env.Race.terran), sc2_env.Agent(sc2_env.Race.terran)],
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'], players=2)
    return sc2_env.SC2Env(**env_args)

