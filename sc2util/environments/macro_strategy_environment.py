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

# See the ResolveBattle trigger in the .SC2Map
MAX_STEPS = 10

action_to_ability_id = {
    1: 3771,
    2: 3773,
    3: 3775,
    4: 3777,
    5: 3779,
    6: 3781,
    7: 3783,
    8: 3785,
}
action_to_name = {
    0: "No-Op",
    1: "Paper 1",
    2: "Rock 1",
    3: "Scissors 1",
    4: "Build SCV",
    5: "Paper 2",
    6: "Rock 2",
    7: "Scissors 2",
    8: "Scout",
}

class MacroStrategyEnvironment():
    def __init__(self):
        self.sc2env = make_sc2env()

    def reset(self):
        self.step_sc2env()
        self.steps = 0
        state, reward, done, info = unpack_timestep(self.last_timestep)
        return state

    def action_space(self):
        from gym.spaces.discrete import Discrete
        return Discrete(len(action_to_name))

    # Step: Take an action and play the game out 10 seconds
    def step(self, action_player1, action_player2=None):
        # 0: first timestep, 1: any other, 2: last timestep
        if self.sc2env._state == 2:
            print('Game is over, cannot take further actions')
            return

        print('Taking action t={}'.format(self.steps))
        self.steps += 1

        if self.steps >= MAX_STEPS:
            print('Game has reached limit of {} actions: simulating endgame'.format(MAX_STEPS))
            self.step_until_endgame()
        else:
            if action_player1 > 0:
                player1_ability_id = action_to_ability_id[action_player1]
                self.use_custom_ability(player1_ability_id, 1)
            if action_player2 > 0:
                player2_ability_id = action_to_ability_id[action_player2]
                self.use_custom_ability(player2_ability_id, 2)
            self.step_sc2env()
        return unpack_timestep(self.last_timestep)


    def step_sc2env(self):
        print('step_sc2env() state={}'.format(self.sc2env._state))
        # Step forward to synchronize clients
        start_time = time.time()
        self.sc2env._controllers[0].step(count=1)
        self.sc2env._controllers[1].step(count=1)
        self.sc2env._controllers[0].observe()
        self.sc2env._controllers[1].observe()

        noop = actions.FUNCTIONS.no_op()
        action_list = [noop, noop]
        self.last_timestep, enemy_timestep = self.sc2env.step(action_list)
        print('SC2Env step took {:.02f} sec'.format(time.time() - start_time))

    def step_until_endgame(self):
        import imutil
        self.sc2env._step_mul = 36
        while self.sc2env._state != 2:
            self.step_sc2env()
            imutil.show(unpack_timestep(self.last_timestep)[0][3])


    def use_custom_ability(self, ability_id, player_id=1):
        # Sends a command directly to the SC2 protobuf API
        # Can cause the pysc2 client to desync, unless step_sc2env() is called afterward
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
        if self.sc2env._state == 2:
            print('Game is over, cannot send action')
            return
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
        'step_mul': 170,  # 17 is ~1 action per second
        'players': [sc2_env.Agent(sc2_env.Race.terran), sc2_env.Agent(sc2_env.Race.terran)],
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'], players=2)
    return sc2_env.SC2Env(**env_args)

