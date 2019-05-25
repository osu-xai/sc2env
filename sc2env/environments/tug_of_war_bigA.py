import numpy as np
import pysc2
from pysc2.agents import base_agent
from pysc2.env import sc2_env
from pysc2.lib import actions, features, units
from pysc2 import maps, lib
from s2clientprotocol import sc2api_pb2 as sc_pb
from sc2env.pysc2_util import register_map
from sc2env.utility import getOneHotState
from copy import copy
import os
import sys

SCREEN_SIZE  = 40
MAP_NAME = 'TugOfWarMarines'
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
building_unit_types = {
    21 : 0, #'Barracks'
    28 : 1, # 'Starport'
    70 : 2, # 'RoboticsFacility'
    60 : 3, # 'Pylon'
    59 : 4, # 'Nexus'
}
maker_cost = {
    'Marine' : 50,
    'Viking' : 75,
    'Colossus' : 200,
    'Pylon' : 75
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
              camera_width_world_units = 100,
              
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
        self.decision_point = 1
        self.miner_index = 12
        self.reset_steps = -1
        self.norm_vector = np.array([1, 1, 1, 1, 50, 50, 1, 1, 1, 1, 50, 50, 100])

        self.signal_of_end = False
        self.end_state = None
        self.maker_cost_np = np.zeros(len(maker_cost))
        for i, mc in enumerate(maker_cost.values()):
            self.maker_cost_np[i] = mc

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
        self.current_obs = self.sc2_env.step([action])[0]
        
        if self.reset_steps >= 10:
            self.sc2_env.reset()
            self.reset_steps = 0
        self.reset_steps += 1
        
        self.end_state = None
        self.decision_point = 1
        
        
        data = self.sc2_env._controllers[0]._client.send(observation = sc_pb.RequestObservation())
        actions_space = self.sc2_env._controllers[0]._client.send(action = sc_pb.RequestAction())

        data = data.observation.raw_data.units
        self.getRewards(data)
#         # Get channel states
#         state = self.get_channel_state(self.current_obs)
        # Get custom states
        state = self.get_custom_state(data)
        
        for rt in self.reward_types:
            self.decomposed_reward_dict[rt] = 0
            self.last_decomposed_reward_dict[rt] = 0

        return state

    def step(self, action):
        end = False
        state = None
        
        ### ACTION TAKING ###
        if sum(action) > 0:
            for a_index, num_action in enumerate(action):
                for _ in range(num_action):
                    self.use_custom_ability(action_to_ability_id[a_index])
        
        action = actions.FUNCTIONS.no_op()
        self.current_obs = self.sc2_env.step([action])[0]
        # Get reward from data
        data = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        data = data.observation.raw_data.units
        end, dp = self.getRewards(data)
        state = self.get_custom_state(data)
#         if not skip:
#           # Get channel states
#           # state = self.get_channel_state(self.current_obs)
#           # Get custom states
#             self.decomposed_rewards = []
#             for rt in self.reward_types:
#                 value_reward = self.decomposed_reward_dict[rt] - self.last_decomposed_reward_dict[rt]
#                 self.decomposed_rewards.append(value_reward)
#             for rt in self.reward_types:
#                 self.last_decomposed_reward_dict[rt] = self.decomposed_reward_dict[rt]
#             #print(self.decomposed_rewards)

        self.end_state = state
            
        if dp or end:
          # Get channel states
          # state = self.get_channel_state(self.current_obs)
          # Get custom states
            self.decomposed_rewards = []
            for rt in self.reward_types:
                value_reward = self.decomposed_reward_dict[rt] - self.last_decomposed_reward_dict[rt]
                self.decomposed_rewards.append(value_reward)
            for rt in self.reward_types:
                self.last_decomposed_reward_dict[rt] = self.decomposed_reward_dict[rt]
                
            return state, self.get_big_A(state[self.miner_index] * 100), end, dp
        else:
            return state, None, end, dp

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

    def get_channel_state(self, observation):
        
        state = observation[3]['feature_screen']
        state = getOneHotState(state, self.input_screen_features)
        state = np.reshape(state, (1, -1))
        
        return state
    def get_custom_state(self, data):
        """
            Plyer1 : Number of Marines Maker
            Plyer1 : Number of Vikings Maker
            Plyer1 : Number of Colossus Maker
            Plyer1 : Number of Pylon
            Plyer1 : Nexus HP
            Plyer1 : Nexus Shield
            Plyer2 : Number of Marines Maker
            Plyer2 : Number of Vikings Maker
            Plyer2 : Number of Colossus Maker
            Plyer2 : Number of Pylon
            Plyer2 : Nexus HP
            Plyer2 : Nexus Shield
            Unspent Miner # get_illegal_actions should change if it change
        """
        state = np.zeros(13)
        for x in data:
            index_enemy = 0
            if x.unit_type in building_unit_types:
                if x.alliance != 1: # 1: Self, 4: Enemy
                    index_enemy = 6
                if x.unit_type != 59: # Non Nexus
#                     if x.unit_type == 70:
#                         input("asds")
                    state[building_unit_types[x.unit_type] + index_enemy] += 1
                else:
                    state[building_unit_types[x.unit_type] + index_enemy] = x.health
                    state[building_unit_types[x.unit_type] + index_enemy + 1] = x.shield
                    
            if x.unit_type == UNIT_TYPES['SCV'] and x.shield == 31:
                # get_illegal_actions should change if it change
                state[self.miner_index] = x.health - 1
        if state[self.miner_index] > 1500:
            state[self.miner_index] = 1500
        state = self.normalization(state)
        
        return state
    
    def normalization(self, state):
        return state / self.norm_vector
    
    def denormalization(self, state):
        return state * self.norm_vector
    
    def getRewards(self, data):
        end = False
        l = len(self.reward_types)
        dp = False
        for x in data:
            if x.unit_type == UNIT_TYPES['SCV']:
                if x.shield <= l:
                    rt = self.reward_types[int(x.shield - 1)]
                    if '_Neg' in rt :
                        self.decomposed_reward_dict[rt] = (x.health - 1) * -1
                    else:
                        self.decomposed_reward_dict[rt] = x.health - 1
                        
                    if 'Sheild' in rt or x.shield == 12 or x.shield == 13:
                        self.decomposed_reward_dict[rt] /= 10
                if x.shield == 41 and x.health == 2:
                    end = True
                if x.shield == 44 and x.health != self.decision_point:
                    self.decision_point = x.health
                    dp = True

        return end, dp
    
    def get_illegal_actions(self, state):
        """
        0: "Effect Marine", 50 cost
        1: "Effect VikingFighter", 75 cost
        2: "Effect Colossus", 75 cost
        3: "Effect Pylon", 200 cost
        4: "no_op",
        """
#         print(state)
        illegal_actions = []
        if state[self.miner_index] < 200:
            illegal_actions.append(2)
        if state[self.miner_index] < 75:
            illegal_actions.append(1)
            illegal_actions.append(3)
        if state[self.miner_index] < 50:
            illegal_actions.append(0)
#         print(illegal_actions)
        return illegal_actions

    def get_big_A(self, miner, 
                  all_A_vectors = None, vector = None, index = 0):
        if all_A_vectors is None:
            all_A_vectors = set()
        if vector is None:
            vector = (0,0,0,0)
        if miner < 50:
            all_A_vectors.add(vector)
            return list(all_A_vectors)
        next_vector = copy(vector)
        self.get_big_A(miner - miner, all_A_vectors, next_vector)
        if miner >= maker_cost['Marine']:
            if index <= 0:
                next_vector = (vector[0] + 1, vector[1],
                                  vector[2], vector[3])
                self.get_big_A(miner - maker_cost['Marine'], all_A_vectors, next_vector, 0)
            if miner >= maker_cost['Viking']:
                if index <= 1:
                    next_vector = (vector[0], vector[1] + 1,
                                  vector[2], vector[3])
                    self.get_big_A(miner - maker_cost['Viking'], all_A_vectors, next_vector, 1)
                if miner >= maker_cost['Pylon']:
                    if index <= 2:
                        next_vector = (vector[0], vector[1],
                                  vector[2], vector[3] + 1)
                        self.get_big_A(miner - maker_cost['Pylon'], all_A_vectors, next_vector, 2)
                    if miner >= maker_cost['Colossus']:
                        if index <= 3:
                            next_vector = (vector[0], vector[1],
                                  vector[2] + 1, vector[3])
                            self.get_big_A(miner - maker_cost['Colossus'], all_A_vectors, next_vector, 3)

        return list(all_A_vectors)
    
    def combine_sa(self, s, actions):
        s = np.repeat(s.reshape((1,-1)), len(actions), axis = 0)
        actions = np.array(actions)
        s[:,:4] += actions
        s[:, self.miner_index] -= np.sum(self.maker_cost_np * actions, axis = 1) / 100
        return s