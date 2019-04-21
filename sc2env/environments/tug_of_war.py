import numpy as np
import pysc2
from pysc2.agents import base_agent
from pysc2.env import sc2_env
from pysc2.lib import actions, features, units
from pysc2 import maps, lib
from s2clientprotocol import sc2api_pb2 as sc_pb
from sc2env.pysc2_util import register_map
from sc2env.utility import getOneHotState
import os
import sys

SCREEN_SIZE  = 40
MAP_NAME = 'TugOfWar'
UNIT_TYPES = {
    'SCV': 45,
    'Marine': 48,
    'Viking': 35,
    'Colossus': 4
}
action_to_ability_id = {
    0: 3771, # Effect Marine
    1: 3773, # Effect VikingFighter
    2: 3775, # Effect Colossus
    3: 3777, # Effect Pylon
}
action_to_name = {
    0: "Effect Marine",
    1: "Effect VikingFighter",
    2: "Effect Colossus",
    3: "Effect Pylon",
    4: "no_op",
}

class TugOfWar():
    def __init__(self, reward_types, map_name = None, unit_type = [], generate_xai_replay = False, xai_replay_dimension = 256, verbose = False):
        if map_name is None:
            map_name = MAP_NAME
        maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
        print("map director: " + str(maps_dir))
        register_map(maps_dir, map_name)
        
        if generate_xai_replay:
            aif=features.AgentInterfaceFormat(
                feature_dimensions=features.Dimensions(screen=SCREEN_SIZE, minimap=SCREEN_SIZE),
                rgb_dimensions=sc2_env.Dimensions(
                screen=(xai_replay_dimension, xai_replay_dimension),
                minimap=(64, 64),
                ),
                action_space=actions.ActionSpace.FEATURES,
                camera_width_world_units = 28,
                #use_camera_position = True,
            )
            step_mul_value = 4
        else:
            aif=features.AgentInterfaceFormat(
              feature_dimensions = features.Dimensions(screen = SCREEN_SIZE, minimap = SCREEN_SIZE),
              action_space = actions.ActionSpace.FEATURES,
              camera_width_world_units = 50,
              
              )
        np.set_printoptions(threshold=sys.maxsize,linewidth=sys.maxsize, precision = 1)
        step_mul_value = 16
        self.sc2_env = sc2_env.SC2Env(
          map_name = map_name,
          agent_interface_format = aif,

          step_mul = step_mul_value,
          game_steps_per_episode = 0,
          score_index = 0,
          visualize = True,)

        
        self.current_obs = None
        self.actions_taken = 0
        self.decomposed_rewards = []
        self.verbose = verbose
        self.unspent_miner = 0

        self.signal_of_end = False
        self.end_state = None


        self.reward_types = reward_types
        self.last_decomposed_reward_dict = {}
        self.decomposed_reward_dict = {}
        for rt in reward_types:
        	self.decomposed_reward_dict[rt] = 0
        	self.last_decomposed_reward_dict[rt] = 0

        unit_type = [UNIT_TYPES['Marine'], UNIT_TYPES['Viking'], UNIT_TYPES['Colossus']]
        self.input_screen_features = {
            "PLAYER_RELATIVE":[1, 4],
            "UNIT_TYPE": unit_type,
            'HIT_POINT': 0,
            'HIT_POINT_RATIO': 0,
            'SHIELD': 0,
            'SHIELD_RATIO': 0,
            'UNIT_DENSITY': 0
        }

    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        self.decomposed_rewards = []
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.actions_taken = 0
        
        # Get channel states
        state = self.get_channel_state(action)
        
        self.end_state = None

        data = self.sc2_env._controllers[0]._client.send(observation = sc_pb.RequestObservation())

        actions_space = self.sc2_env._controllers[0]._client.send(action = sc_pb.RequestAction())
        # look into actions_space

        data = data.observation.raw_data.units
        # print(data)
        # input()
        self.getRewards(data)
        
        for rt in self.reward_types:
            self.decomposed_reward_dict[rt] = 0
            self.last_decomposed_reward_dict[rt] = 0

        return state

    def getRewards(self, data):
        end = False
        l = len(self.reward_types)
        for x in data:
            if x.unit_type == UNIT_TYPES['SCV']:
                if x.shield <= l:
                    rt = self.reward_types[int(x.shield - 1)]
                    if '_Neg' in rt :
                        self.decomposed_reward_dict[rt] = (x.health - 1) * -1
                    else:
                        self.decomposed_reward_dict[rt] = x.health - 1
                if x.shield == l + 1: 
                    self.unspent_miner = x.health - 1
                if x.shield == l + 2 and x.health == 2:
                    end = True
        return end

    def step(self, action, skip = False):
        end = False

        ### ACTION TAKING ###
        if action < 4:
            self.use_custom_ability(action_to_ability_id[action])
        elif action > 4:
            print("Invalid action: check final layer of network")
        
        # Get channel states
        action = actions.FUNCTIONS.no_op()
        state = self.get_channel_state(action)
        
        # Get reward from data
        data = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        data = data.observation.raw_data.units
        end = self.getRewards(data)

        if not skip:
            self.decomposed_rewards = []
            for rt in self.reward_types:
                value_reward = self.decomposed_reward_dict[rt] - self.last_decomposed_reward_dict[rt]
                self.decomposed_rewards.append(value_reward)
            for rt in self.reward_types:
                self.last_decomposed_reward_dict[rt] = self.decomposed_reward_dict[rt]
            #print(self.decomposed_rewards)
        if end:
            self.end_state = state
            
        return state, end

    def register_map(self, map_dir, map_name):
        map_filename = map_name + '.SC2Map'
        class_definition = dict(prefix = map_dir, filename = map_filename, players = 1)
        constructed_class = type(map_name, (pysc2.maps.lib.Map,), class_definition)
        globals()[map_name] = constructed_class


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
        client = self.sc2_env._controllers[player_id - 1]._client
        if self.verbose:
            print('Calling client.send_req for player_id {}'.format(player_id))
        if self.sc2_env._state == 2:
            print('Game is over, cannot send action')
            return
        client.send_req(request)

    def get_channel_state(self, action):
        self.current_obs = self.sc2_env.step([action])[0]
        observation = self.current_obs
        state = observation[3]['feature_screen']
        state = getOneHotState(state, self.input_screen_features)
#         print(state)
#         input()
        state = np.reshape(state, (1, -1))
        
        return state
    def get_custom_state(self):
        pass
#     def get_available_actions(self, obs):
#         #print(obs.observation.available_actions)
#         return obs.observation.available_actions

#     def check_action(self, obs, action):
        
#         return action in self.get_available_actions(obs)


