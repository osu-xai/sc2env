import numpy as np
import torch
import pysc2
from pysc2.agents import base_agent
from pysc2.env import sc2_env
from pysc2.lib import actions, features, units
from pysc2 import maps, lib
from s2clientprotocol import sc2api_pb2 as sc_pb
from sc2env.pysc2_util import register_map
from sc2env.utility import getOneHotState
from copy import copy, deepcopy
import os
import sys

SCREEN_SIZE  = 40
MAP_NAME = 'TugOfWar-2-Lane-Self-Play-No-FIFO'
UNIT_TYPES = {
    'SCV': 45,
    'Marine': 48,
    'Baneling': 9,
    'Immortal': 83
}
action_to_ability_id = {
    0: 146, # Effect Marine T
    1: 148, # Effect Baneling T
    2: 150, # Effect Immortal T
    3: 156, # Effect Marine B
    4: 158, # Effect Baneling B
    5: 160, # Effect Immortal B
    6: 152, # Effect Pylon
    'switch_player': 154,
}
action_to_name = {
    0: "Effect Marine T",
    1: "Effect Baneling T",
    2: "Effect Immortal T",
    3: "Effect Marine B",
    4: "Effect Baneling B",
    5: "Effect Immortal B",
    6: "Effect Pylon",
    7: "no_op",
}

unit_types_player1 = {
    21 : 1, #'Barracks'
    28 : 2, # 'Starport'
    70 : 3, # 'RoboticsFacility'
    60 : 7, # 'Pylon'
    59 : 27, # 'Nexus'
    48 : 15, # 'Marine'
    9 : 16, # 'Baneling'
    83 : 17 # 'Immortal'
}
unit_types_player2 = {
    21 : 8, #'Barracks'
    28 : 9, # 'Starport'
    70 : 10, # 'RoboticsFacility'
    60 : 14, # 'Pylon'
    59 : 29, # 'Nexus'
    48 : 21, # 'Marine'
    9 : 22, # 'Baneling' 
    83 : 23 # 'Immortal'
}
reward_dict = {
    1: "damge_to_player1_top_2",
    2: "damge_to_player1_bottom_2",
    101: "damge_to_player2_top_1",
    102: "damge_to_player2_bottom_1",
    3: "player1_wins_1",
    103: "player2_wins_2"
}
maker_cost = {
    'Marine T' : 50,
    'Baneling T' : 75,
    'Immortal T' : 200,
    'Marine B' : 50,
    'Baneling B' : 75,
    'Immortal B' : 200,
}

action_component_names = {
    0: 'Marine',
    1: 'Baneling',
    2: 'Immortal',
    3: 'Pylon'
}
class TugOfWar():
    def __init__(self, map_name = None, unit_type = [], generate_xai_replay = False, xai_replay_dimension = 256, verbose = False):
        if map_name is None:
            map_name = MAP_NAME
        maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
        print("map director: " + str(maps_dir))
        register_map(maps_dir, map_name)
        
        if generate_xai_replay:
            aif=features.AgentInterfaceFormat(
                feature_dimensions=features.Dimensions(screen=SCREEN_SIZE, minimap=SCREEN_SIZE),
                rgb_dimensions=sc2_env.Dimensions(

                screen=(1.5*xai_replay_dimension, xai_replay_dimension),
                minimap=(64, 64),
                ),
                action_space=actions.ActionSpace.FEATURES,
                camera_width_world_units = 28,
                #use_camera_position = True,
            )

            step_mul_value = 4
            # step_mul_value = 16

        else:
            aif=features.AgentInterfaceFormat(
              feature_dimensions = features.Dimensions(screen = SCREEN_SIZE, minimap = SCREEN_SIZE),
              action_space = actions.ActionSpace.FEATURES,
              camera_width_world_units = 100,
              )
            step_mul_value = 16
        np.set_printoptions(threshold=sys.maxsize,linewidth=sys.maxsize, precision = 2)
        
        self.sc2_env = sc2_env.SC2Env(
          map_name = map_name,
          agent_interface_format = aif,

          step_mul = step_mul_value,
          game_steps_per_episode = 0,
          score_index = 0,
          visualize = True,)

        
        self.current_obs = None
        self.decomposed_rewards = []
        self.verbose = verbose
        
        
        self.miner_index = 0
        self.reset_steps = -1
        self.mineral_limiation = 1500
        self.norm_vector = np.array([700, 50, 40, 20, 50, 40, 20, 3,
                                    50, 40, 20, 50, 40, 20, 3,
                                    50, 40, 20, 50, 40, 20, 
                                    50, 40, 20, 50, 40, 20,
                                    2000, 2000, 2000, 2000, 40])
        
        self.decision_point = 1
        self.signal_of_end = False
        self.end_state = None
        self.maker_cost_np = np.zeros(len(maker_cost))
        # Have to change the combine func if this changed
        self.pylon_cost = 300
        self.pylon_index = 7
        for i, mc in enumerate(maker_cost.values()):
            self.maker_cost_np[i] = mc

        self.last_decomposed_reward_dict = {}
        self.decomposed_reward_dict = {}
        self.num_waves = 0
        
        maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
        action_dict_path = os.path.join(os.path.dirname(__file__), 'action_1500_tow_2L.pt')
        print("actions path:" + action_dict_path)
        self.a_dict = torch.load(action_dict_path)
        self.action_space = self.a_dict['actions']
        self.action_space_dict = self.a_dict['mineral']
#         print(self.a_dict.keys())
    # at the end of the reward type name:
    # 1 means for player 1 is positive, for player 2 is negative
    # 2 means for player 2 is positive, for player 1 is negative
        self.reward_types = list(reward_dict.values())
        # print(self.reward_types)
        for rt in self.reward_types:
        	self.decomposed_reward_dict[rt] = 0
        	self.last_decomposed_reward_dict[rt] = 0

        unit_type = [UNIT_TYPES['Marine'], UNIT_TYPES['Baneling'], UNIT_TYPES['Immortal']]
#         self.input_screen_features = {
#             "PLAYER_RELATIVE":[1, 4],
#             "UNIT_TYPE": unit_type,
#             'HIT_POINT': 0,
#             'HIT_POINT_RATIO': 0,
#             'SHIELD': 0,
#             'SHIELD_RATIO': 0,
#             'UNIT_DENSITY': 0
#         }


    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        self.decomposed_rewards = []
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.current_obs = self.sc2_env.step([action])[0]
        
        if self.reset_steps >= 10:
            self.sc2_env.reset()
            self.reset_steps = 0
        self.reset_steps += 1
        
        self.end_state = None
        self.decision_point = 1
        self.num_waves = 0
        
        data = self.sc2_env._controllers[0]._client.send(observation = sc_pb.RequestObservation())
        actions_space = self.sc2_env._controllers[0]._client.send(action = sc_pb.RequestAction())

        data = data.observation.raw_data.units
        self.getRewards(data)
        # Get channel states
#         state = self.get_channel_state(self.current_obs)

        # Get custom states
        state_1 = self.get_custom_state(data, 1)
        state_2 = self.get_custom_state(data, 2)
        
        for rt in self.reward_types:
            self.decomposed_reward_dict[rt] = 0
            self.last_decomposed_reward_dict[rt] = 0
#         self.use_custom_ability(action_to_ability_id['switch_player'])
        return state_1, state_2

    def step(self, action, player):
        done = False
        dp = False
        data = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        data = data.observation.raw_data.units
#         pretty_print_units(data)
        #input("pausing at step")
            ## ACTION TAKING ###
        if len(action) > 0:
            current_player = self.get_current_player(data)
#             print(current_player)
            if current_player != player:
#                 print('switch')
                self.use_custom_ability(action_to_ability_id['switch_player'])
            
            for a_index, num_action in enumerate(action):
                for _ in range(int(num_action)):
#                     print(a_index, num_action)
                    self.use_custom_ability(action_to_ability_id[a_index])
#             self.use_custom_ability(action_to_ability_id[0])
            action = actions.FUNCTIONS.no_op()
            self.current_obs = self.sc2_env.step([action])[0]
                    
        else:
            action = actions.FUNCTIONS.no_op()
            self.current_obs = self.sc2_env.step([action])[0]
            # Get reward from data
            done, dp = self.getRewards(data)

            if dp or done:
              # Get channel states
              # state = self.get_channel_state(self.current_obs)
              # Get custom states
                self.num_waves += 1
                
                state_1 = self.get_custom_state(data, 1)
                state_2 = self.get_custom_state(data, 2)
                if done:
                    self.end_state_1 = state_1
                    self.end_state_2 = state_2
#                 print(self.decomposed_reward_dict)
                self.decomposed_rewards = []
                for rt in self.reward_types:
                    value_reward = self.decomposed_reward_dict[rt] - self.last_decomposed_reward_dict[rt]
                    self.decomposed_rewards.append(value_reward)
                # TODO: consider to merge two for
                for rt in self.reward_types:
                    self.last_decomposed_reward_dict[rt] = self.decomposed_reward_dict[rt]

                return state_1, state_2, done, dp
        return None, None, done, dp

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
    def get_custom_state(self, data, player):
        """
        State of Player 1:
        For the player 2, the position of player1 label and player2 label switch
            Unspent Miner 0
            
            Plyer1 : Number of Marines Maker 1 T
            Plyer1 : Number of Banelings Maker 2 T
            Plyer1 : Number of Immortal Maker 3 T
            Plyer1 : Number of Marines Maker 4 B
            Plyer1 : Number of Banelings Maker 5 B
            Plyer1 : Number of Immortal Maker 6 B
            Plyer1 : Number of Pylon 7
            
            Plyer2 : Number of Marines Maker 8 T
            Plyer2 : Number of Banelings Maker 9 T
            Plyer2 : Number of Immortal Maker 10 T
            Plyer2 : Number of Marines Maker 11 B
            Plyer2 : Number of Banelings Maker 12 B
            Plyer2 : Number of Immortal Maker 13 B
            Plyer2 : Number of Pylon 14
            
            Player1: Marine on the field 15 T
            Player1: Banelings on the field 16 T
            Player1: Immortal on the field 17 T
            Player1: Marine on the field 18 B
            Player1: Banelings on the field 19 B
            Player1: Immortal on the field 20 B
            
            Player2: Marine on the field 21 T
            Player2: Banelings on the field 22 T
            Player2: Immortal on the field 23 T
            Player2: Marine on the field 24 B
            Player2: Banelings on the field 25 B
            Player2: Immortal on the field 26 B
            
            Player1: Hit point of Nexus T 27 T
            Player1: Hit point of Nexus T 28 B
            Player2: Hit point of Nexus T 29 T
            Player2: Hit point of Nexus T 30 B
            
            Number of waves
        """
        if player == 1:
            utp_1 = unit_types_player1
            utp_2 = unit_types_player2
        else:
            utp_1 = unit_types_player2
            utp_2 = unit_types_player1
            
        state = np.zeros(31)
        for x in data:
            if x.unit_type in unit_types_player1:
                Bottom_index_addition_unit_building = 0
                Bottom_index_addition_hp = 0
                if x.alliance == 1: # 1: Self, 4: Enemy
                    unit_types = utp_1
                else:
                    unit_types = utp_2
                
                # Bottom lane
                if x.pos.y < 32:
                    Bottom_index_addition_unit_building = 3
                    Bottom_index_addition_hp = 1
                if x.unit_type == 60:
                    Bottom_index_addition_unit_building = 0
                    Bottom_index_addition_hp = 0
                    
                if x.unit_type != 59: # Non Nexus
                    state[unit_types[x.unit_type] + Bottom_index_addition_unit_building] += 1
                else:
                    state[unit_types[x.unit_type] + Bottom_index_addition_hp] = x.health
            
            if player == 1:
                mineral_scv_index = 4
            else:
                mineral_scv_index = 104
                
            if x.unit_type == UNIT_TYPES['SCV'] and x.shield == mineral_scv_index:
                # get_illegal_actions should change if it change
                state[self.miner_index] = x.health - 1
                
        if state[self.miner_index] > self.mineral_limiation:
            state[self.miner_index] = self.mineral_limiation
        state = np.append(state, self.num_waves)
#         state = self.normalization(state)
        
        return state
    
    def get_current_player(self, data):
        for x in data:
            if x.unit_type == UNIT_TYPES['SCV'] and x.shield == 45:
                return x.health
    
    def normalization(self, state):
        return state / self.norm_vector
    
    def denormalization(self, state):
        return state * self.norm_vector
    
    def getRewards(self, data):
        """
            1:   Damage to player 1 T
            2:   Damage to player 1 B
            101: Damage to player 2 T
            102: Damage to player 2 B
            3:   Player 1 wins
            103: Player 2 wins
        """
        end = False
#         l = len(self.reward_types)
        dp = False
        for x in data:
            if x.unit_type == UNIT_TYPES['SCV']:
                if x.shield in reward_dict.keys():
                    reward_type = reward_dict[x.shield]
                    self.decomposed_reward_dict[reward_type] = x.health - 1
                    
                if x.shield == 41 and x.health == 2:
                    end = True
                if x.shield == 44 and x.health != self.decision_point:
                    self.decision_point = x.health
                    dp = True

        return end, dp

    def sperate_reward(self, reward):
        reward = deepcopy(reward)
        reward_1 = []
        reward_2 = []
        
        for i, rt in enumerate(self.reward_types):
            if rt[-1] == '1':
                reward_1.append(reward[i])
                reward_2.append(reward[i] * -1)
            else:
                reward_1.append(reward[i] * -1)
                reward_2.append(reward[i])
        return reward_1, reward_2
        
#     def get_big_A(self, mineral, num_of_pylon):
# #         print(mineral)
#         big_A = self.a_dict['actions'][ : self.a_dict['mineral'][mineral]]
#         if num_of_pylon < 3:
#             mineral_after_pylong = mineral - (self.pylon_cost + num_of_pylon * 100)
# #             print(mineral_after_pylong)
#             if mineral_after_pylong > 0:
#                 action_after_pylon = self.a_dict['actions'][ : self.a_dict['mineral'][mineral_after_pylong]].copy()
#                 action_after_pylon[:, -1] = 1
#                 big_A = np.append(big_A, action_after_pylon, axis = 0)
                
#         return big_A

    def get_big_A(self, mineral, num_of_pylon, is_train = False):
#         print(mineral)
#         print(self.action_space_dict[num_of_pylon][mineral])
        big_A = self.action_space[num_of_pylon][: self.action_space_dict[num_of_pylon][mineral]]
        top_lane = np.zeros((len(big_A), 7))
        bottom_lane = np.zeros((len(big_A), 7))
        
        top_lane[:, 0: 3] = big_A[:, 0: 3].copy()
        top_lane[:, 6] = big_A[:, 3].copy()
        
        bottom_lane[:, 3: 7] = big_A.copy()
        
#         print(top_lane)
#         print(bottom_lane)
        
        big_A = np.vstack((top_lane, bottom_lane))
#         print(big_A)
#         return big_A
        if is_train:
#             print(len(big_A))
            big_A_I_1x = big_A[big_A[:, 2] > 0].copy()#[big_A[:, 5] > 0]
            big_A_I_0x = big_A[big_A[:, 2] == 0].copy()#[big_A[:, 5] == 0]

            big_A_I_10 = big_A_I_1x[big_A_I_1x[:, 5] == 0].reshape(-1, 7)
            big_A_I_11 = big_A_I_1x[big_A_I_1x[:, 5] > 0].reshape(-1, 7)
            big_A_I_01 = big_A_I_0x[big_A_I_0x[:, 5] > 0].reshape(-1, 7)

#             print(len(big_A_I_10), len(big_A_I_11), len(big_A_I_01))
#             print(big_A_I_10.shape,big_A_I_11.shape, big_A_I_01.shape)

            big_A_I = np.vstack([big_A_I_10, big_A_I_11,big_A_I_01])

            big_A_Noop = big_A[0]

            big_A_P = big_A[big_A[:, 6] > 0].copy()

#             print(len(big_A), len(big_A_I), len(big_A_P))
            lenth_m_b = len(big_A) - len(big_A_I) - len(big_A_P)
#             print(lenth_m_b)

            num_I = lenth_m_b // len(big_A_I) if len(big_A_I) > 0 else 0
            num_P = lenth_m_b // len(big_A_P) if len(big_A_P) > 0 else 0
            num_Noop = lenth_m_b

            num_I = num_I if num_I > 0 else 0
            num_P = num_P if num_P > 0 else 0
            num_Noop = num_Noop if num_Noop > 0 else 0

#             print(lenth_m_b,  len(big_A_I))=
            big_A_I = np.repeat(big_A_I.reshape(-1, 7), num_I, axis = 0).reshape(-1, 7)
            big_A_P = np.repeat(big_A_P.reshape(-1, 7), num_P, axis = 0).reshape(-1, 7)
            big_A_Noop = np.repeat(big_A_Noop.reshape(-1, 7), num_Noop, axis = 0).reshape(-1, 7)

            big_A = np.vstack([big_A, big_A_I, big_A_P, big_A_Noop])
#             print(len(big_A))
#             input()
#             print("##################")
#             print(mineral)
#             l = len(big_A)
#             num_noop = 0
#             for b_a in big_A:
#                 if np.sum(b_a) == 0:
#                     num_noop += 1

#             print(num_noop / l)

#             print(len(big_A[big_A[:, 0] > 0]) / l)
#             print(len(big_A[big_A[:, 1] > 0]) / l)
#             print(len(big_A[big_A[:, 2] > 0]) / l)
#             print(len(big_A[big_A[:, 3] > 0]) / l)
#             print(len(big_A[big_A[:, 4] > 0]) / l)
#             print(len(big_A[big_A[:, 5] > 0]) / l)
#             print(len(big_A[big_A[:, 6] > 0]) / l)
#             input()
        return big_A

    def combine_sa(self, s, actions):
        # Repeat state maxtix corressponding to the number of candidate actions
        s = np.repeat(s.reshape((1,-1)), len(actions), axis = 0)
        actions = np.array(actions)
        # Add all candidate acgtions to the corressponding vector of the state matrix
        s[:,1:8] += actions
        
#         print((self.maker_cost_np * actions[: -1]).shape)
        s[:, self.miner_index] -= np.sum(self.maker_cost_np * actions[:, :-1], axis = 1)
        
        index_has_pylon = actions[:, -1] > 0
        num_of_pylon = s[index_has_pylon, self.pylon_index]
        s[index_has_pylon, self.miner_index] -= (self.pylon_cost + (num_of_pylon - 1) * 100)
        
        assert np.sum(s[:, self.miner_index] >= 0) == s.shape[0]
        return s
  