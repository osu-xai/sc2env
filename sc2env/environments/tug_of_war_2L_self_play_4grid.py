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
import random

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
    59 : 63, # 'Nexus'
    48 : 15, # 'Marine'
    9 : 16, # 'Baneling'
    83 : 17 # 'Immortal'
}
unit_types_player2 = {
    21 : 8, #'Barracks'
    28 : 9, # 'Starport'
    70 : 10, # 'RoboticsFacility'
    60 : 14, # 'Pylon'
    59 : 65, # 'Nexus'
    48 : 39, # 'Marine'
    9 : 40, # 'Baneling'
    83 : 41 # 'Immortal'
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
        self.norm_vector = np.array([1500,           # Player 1 unspent minerals
                                    30, 30, 10,     # Player 1 top lane building
                                    30, 30, 10,     # Player 1 bottom lane building
                                    3,              # Player 1 pylons
                                    30, 30, 10,     # Player 2 top lane building
                                    30, 30, 10,     # Player 2 bottom lane building
                                    3,              # Player 2 pylons
                                    30, 30, 10,     # Player 1 units top lane grid 1
                                    30, 30, 10,     # Player 1 units top lane grid 2 
                                    30, 30, 10,     # Player 1 units top lane grid 3
                                    30, 30, 10,     # Player 1 units top lane grid 4
                                    30, 30, 10,     # Player 1 units bottom lane grid 1
                                    30, 30, 10,     # Player 1 units bottom lane grid 2 
                                    30, 30, 10,     # Player 1 units bottom lane grid 3
                                    30, 30, 10,     # Player 1 units bottom lane grid 4
                                    30, 30, 10,     # Player 2 units top lane grid 1
                                    30, 30, 10,     # Player 2 units top lane grid 2 
                                    30, 30, 10,     # Player 2 units top lane grid 3
                                    30, 30, 10,     # Player 2 units top lane grid 4
                                    30, 30, 10,     # Player 2 units bottom lane grid 1
                                    30, 30, 10,     # Player 2 units bottom lane grid 2 
                                    30, 30, 10,     # Player 2 units bottom lane grid 3
                                    30, 30, 10,     # Player 2 units bottom lane grid 4
                                    2000, 2000,     # Player 1 Nexus HP (top, bottom)
                                    2000, 2000,     # Player 2 Nexus HP (top, bottom)
                                    40])              # Wave Number
        
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
            
            Player1: Marine on the field 15 T1
            Player1: Banelings on the field 16 T1
            Player1: Immortal on the field 17 T1
            Player1: Marine on the field 18 T2
            Player1: Banelings on the field 19 T2
            Player1: Immortal on the field 20 T2
            Player1: Marine on the field 21 T3
            Player1: Banelings on the field 22 T3
            Player1: Immortal on the field 23 T3
            Player1: Marine on the field 24 T4
            Player1: Banelings on the field 25 T4
            Player1: Immortal on the field 26 T4
 
            Player1: Marine on the field 27 B1
            Player1: Banelings on the field 28 B1
            Player1: Immortal on the field 29 B1
            Player1: Marine on the field 30 B2
            Player1: Banelings on the field 31 B2
            Player1: Immortal on the field 32 B2
            Player1: Marine on the field 33 B3
            Player1: Banelings on the field 34 B3
            Player1: Immortal on the field 35 B3
            Player1: Marine on the field 36 B4
            Player1: Banelings on the field 37 B4
            Player1: Immortal on the field 38 B4
            
            Player2: Marine on the field 39 T1
            Player2: Banelings on the field 40 T1
            Player2: Immortal on the field 41 T1
            Player2: Marine on the field 42 T2
            Player2: Banelings on the field 43 T2
            Player2: Immortal on the field 44 T2
            Player2: Marine on the field 45 T3
            Player2: Banelings on the field 46 T3
            Player2: Immortal on the field 47 T3
            Player2: Marine on the field 48 T4
            Player2: Banelings on the field 49 T4
            Player2: Immortal on the field 50 T4
           
            Player2: Marine on the field 51 B1
            Player2: Banelings on the field 52 B1
            Player2: Immortal on the field 53 B1
            Player2: Marine on the field 54 B2
            Player2: Banelings on the field 55 B2
            Player2: Immortal on the field 56 B2
            Player2: Marine on the field 57 B3
            Player2: Banelings on the field 58 B3
            Player2: Immortal on the field 59 B3
            Player2: Marine on the field 60 B4
            Player2: Banelings on the field 61 B4
            Player2: Immortal on the field 62 B4
            
            Player1: Hit point of Nexus T 63 T
            Player1: Hit point of Nexus T 64 B
            Player2: Hit point of Nexus T 65 T
            Player2: Hit point of Nexus T 66 B
            
            Number of waves
        """
        if player == 1:
            utp_1 = unit_types_player1
            utp_2 = unit_types_player2
        else:
            utp_1 = unit_types_player2
            utp_2 = unit_types_player1
            
        state = np.zeros(67)
        for entry in data:
            if entry.unit_type in unit_types_player1:
                if entry.alliance == 1: # 1: Self, 4: Enemy
                    unit_types = utp_1
                    
                elif entry.alliance == 4:
                    unit_types = utp_2
                    
                else:
                    print("ERROR!! Alliance not recognized")

                if entry.pos.y < 32:
                    bottom_entry = True
                else:
                    bottom_entry = False

                #building
                if unit_types[entry.unit_type] >= 0 and unit_types[entry.unit_type] <= 14:
                    # Not a Pylon
                    if entry.unit_type != 60 and bottom_entry == True:
                        adjust = 3
                    else:
                        adjust = 0
                #units on field
                elif unit_types[entry.unit_type] >= 15 and unit_types[entry.unit_type] <= 62:
                    # Grid
                    if player == 1:
                        if entry.pos.x >= 0 and entry.pos.x <= 45.5:
                            grid_index = 0
                        elif entry.pos.x > 45.5 and entry.pos.x <= 64:
                            grid_index = 1
                        elif entry.pos.x > 64 and entry.pos.x < 82.5:
                            grid_index = 2
                        elif entry.pos.x >= 82.5 and entry.pos.x <= 128:
                            grid_index = 3
                        else:
                            print("ERROR!!! Unit recorded is somehow out of range of the map")
                    else:
                        if entry.pos.x >= 0 and entry.pos.x <= 45.5:
                            grid_index = 3
                        elif entry.pos.x > 45.5 and entry.pos.x <= 64:
                            grid_index = 2
                        elif entry.pos.x > 64 and entry.pos.x < 82.5:
                            grid_index = 1
                        elif entry.pos.x >= 82.5 and entry.pos.x <= 128:
                            grid_index = 0
                        else:
                            print("ERROR!!! Unit recorded is somehow out of range of the map")
                    
                    if bottom_entry == True:
                        adjust = (12 + (3 * grid_index))
                    else:
                        adjust = (3 * grid_index)
                # Nexus
                elif unit_types[entry.unit_type] >= 63 and unit_types[entry.unit_type] <= 66:
                    if bottom_entry == True:
                        adjust = 1
                    else:
                        adjust = 0

                raw_idx = unit_types[entry.unit_type]
                true_idx = raw_idx + adjust
                # Save health if nexus
                if entry.unit_type == 59:
                    state[true_idx] = entry.health
                else:
                    state[true_idx] += 1
            
            if player == 1:
                mineral_scv_index = 4
            else:
                mineral_scv_index = 104
                
            if entry.unit_type == UNIT_TYPES['SCV'] and entry.shield == mineral_scv_index:
                # get_illegal_actions should change if it change
                state[self.miner_index] = entry.health - 1
                
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

    def tree_hierarchy(self, mineral, num_of_pylon, tree_A, adjust_for_lane):
        # print("tree A: ")
        # print(tree_A)
        # print("mineral: " + str(mineral))
        # input("Press Enter to Continue: ")
        if mineral >= 0 and mineral < 50:
            choices = ['noop']
        elif mineral >= 50 and mineral < 75:
            choices = ['noop', 'marine']
        elif mineral >= 75 and mineral < 200:
            choices = ['noop', 'marine', 'baneling']
        elif mineral >= 200 and mineral < 300:
            choices = ['noop', 'marine', 'baneling', 'immortal']
        elif (mineral >= 300 and num_of_pylon == 0) or (mineral >= 400 and num_of_pylon == 1) or (mineral >= 500 and num_of_pylon == 2):
            choices = ['noop', 'marine', 'baneling', 'immortal', 'pylon']
        elif (mineral < 400 and num_of_pylon == 1) or (mineral < 500 and num_of_pylon == 2) or (num_of_pylon == 3):
            choices = ['noop', 'marine', 'baneling', 'immortal']
        else:
            print("ERROR!! Mineral choice not recognized")
            print(tree_A)
            print(mineral)
            return tree_A

        pick_idx = random.randint(0, len(choices) - 1)

        picked_action = choices[pick_idx]

        if picked_action == 'noop':
            print(tree_A)
            return tree_A
        elif picked_action == 'marine':
            tree_A[0 + adjust_for_lane] += 1
            mineral -= 50
            tree_A = self.tree_hierarchy(mineral, num_of_pylon, tree_A, adjust_for_lane)
        elif picked_action == 'baneling':
            tree_A[1 + adjust_for_lane] += 1
            mineral -= 75
            tree_A = self.tree_hierarchy(mineral, num_of_pylon, tree_A, adjust_for_lane)
        elif picked_action == 'immortal':
            tree_A[2 + adjust_for_lane] += 1
            mineral -= 200
            tree_A = self.tree_hierarchy(mineral, num_of_pylon, tree_A, adjust_for_lane)
        elif picked_action == 'pylon':
            tree_A[3] += 1
            adjust_pylon_cost = 100 * num_of_pylon
            mineral -= 300 + adjust_pylon_cost
            num_of_pylon += 1
            tree_A = self.tree_hierarchy(mineral, num_of_pylon, tree_A, adjust_for_lane)
        else:
            print("ERROR!! Action picked is not recognized")
            print(picked_action)
            return tree_A
        return tree_A

    def get_big_A(self, mineral, num_of_pylon, is_train = 0):
#         print(mineral)
#         print(self.action_space_dict[num_of_pylon][mineral])
#         mineral = int(mineral)
#         print(mineral, num_of_pylon)
        if is_train == 0 or is_train == 1:
            
            big_A = self.action_space[num_of_pylon][: self.action_space_dict[num_of_pylon][mineral]]
            top_lane = np.zeros((len(big_A), 7))
            bottom_lane = np.zeros((len(big_A), 7))
            
            top_lane[:, 0: 3] = big_A[:, 0: 3].copy()
            top_lane[:, 6] = big_A[:, 3].copy()
            
            bottom_lane[:, 3: 7] = big_A.copy()
            
    #         print(top_lane)
    #         print(bottom_lane)
            
            big_A = np.vstack((top_lane, bottom_lane))
            big_A = np.unique(big_A, axis=0)
    #         print(big_A)
    #         return big_A

        if is_train == 1:
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

        elif is_train == 2:
            tree_A = np.zeros(7)
            pick_lane = random.randint(0, 1)
            # top lane
            if pick_lane == 0:
                adjust_for_lane = 0
            # bottom lane
            else:
                adjust_for_lane = 4
            big_A = self.tree_hierarchy(mineral, num_of_pylon, tree_A, adjust_for_lane)
            print("created action:")
            print(big_A)
            print("---------------")

        return big_A

    def combine_sa(self, s, actions):
        # Repeat state maxtix corressponding to the number of candidate actions
        s = np.repeat(s.reshape((1,-1)), len(actions), axis = 0)
        actions = np.array(actions)
        # Add all candidate acgtions to the corressponding vector of the state matrix
        s[:,1:7] += actions[:, : -1]
        
#         print((self.maker_cost_np * actions[: -1]).shape)
        s[:, self.miner_index] -= np.sum(self.maker_cost_np * actions[:, :-1], axis = 1)
        
        
        index_has_pylon = actions[:, -1] > 0
        while sum(index_has_pylon) != 0:
            num_of_pylon = s[index_has_pylon, self.pylon_index]
            s[index_has_pylon, self.pylon_index] += 1
            s[index_has_pylon, self.miner_index] -= (self.pylon_cost + num_of_pylon * 100)
            
            actions[index_has_pylon, -1] -= 1
            index_has_pylon = actions[:, -1] > 0
        
        assert np.sum(s[:, self.miner_index] >= 0) == s.shape[0]
        return s
  