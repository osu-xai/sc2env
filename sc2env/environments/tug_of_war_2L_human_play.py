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
import json
import requests
import ast

SCREEN_SIZE  = 40
MAP_NAME = 'TugOfWar-2-Lane-Self-Play-No-FIFO'
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
        np.set_printoptions(threshold=sys.maxsize,linewidth=sys.maxsize, precision = 2)
        
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
    def get_data(self):
        '''
        ['DecisionPoint', 'P1BanelingsBottom', 'P1BanelingsTop', 'P1BanesBottomBuilding', 'P1BanesTopBuilding', 'P1ImmortalsBottom', 'P1ImmortalsBottomBuilding', 'P1ImmortalsTop', 'P1ImmortalsTopBuilding', 'P1MarinesBottom', 'P1MarinesBottomBuilding', 'P1MarinesTop', 'P1MarinesTopBuilding', 'P1Minerals', 'P1NexusBottomDamage', 'P1NexusBottomHP', 'P1NexusTopDamage', 'P1NexusTopHP', 'P1PylonsBuilding', 'P1Win', 'P2BanelingsBottom', 'P2BanelingsTop', 'P2BanesBottomBuilding', 'P2BanesTopBuilding', 'P2ImmortalsBottom', 'P2ImmortalsBottomBuilding', 'P2ImmortalsTop', 'P2ImmortalsTopBuilding', 'P2MarinesBottom', 'P2MarinesBottomBuilding', 'P2MarinesTop', 'P2MarinesTopBuilding', 'P2Minerals', 'P2NexusBottomDamage', 'P2NexusBottomHP', 'P2NexusTopDamage', 'P2NexusTopHP', 'P2PylonsBuilding', 'P2Win', 'currentPlayer', 'decisionPointCounter', 'end', 'incomeReceiveCounter', 'newWave', 'wave']

        '''
        data = json.loads(
            requests.get('https://spreadsheets.google.com/feeds/list/1tnKrwUpKEflnAe5CbZj5SpPXd-12zV-8mRQK5qecYlw/2/public/basic?alt=json').content)
        data_dict = ast.literal_eval(data['feed']['entry'][0]['title']['$t'])
#         print(sorted(data_dict.keys()))
#         print(data_dict['DecisionPoint'])
        return data_dict
    
    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        print("waiting for new game...")
        data = self.get_data()
        self.data = data
        print(data['wave'])
        while True:
            data = self.get_data()
            if data['wave'] == '1':
                break
        
        self.decomposed_rewards = []
        self.end_state = None
        self.decision_point = 1
        self.num_waves = 0
        
        data = self.get_data()

        # Get custom states
        state = self.get_custom_state(data)
        
        for rt in self.reward_types:
            self.decomposed_reward_dict[rt] = 0
            self.last_decomposed_reward_dict[rt] = 0
#         self.use_custom_ability(action_to_ability_id['switch_player'])
        
        return state

    def step(self, action):
        done = False
        dp = False
        data = self.get_data()
        ## ACTION TAKING ###
        if len(action) > 0:
            self.send_actions(action, data['DecisionPoint'])
        else:
            done, dp = self.getRewards(data)
            if dp or done:
              # Get channel states
              # state = self.get_channel_state(self.current_obs)
              # Get custom states
                self.num_waves += 1
                
                state = self.get_custom_state(data)
                if done:
                    self.end_state = state
#                 print(self.decomposed_reward_dict)
                self.decomposed_rewards = []
                for rt in self.reward_types:
                    value_reward = self.decomposed_reward_dict[rt] - self.last_decomposed_reward_dict[rt]
                    self.decomposed_rewards.append(value_reward)
                # TODO: consider to merge two for
                for rt in self.reward_types:
                    self.last_decomposed_reward_dict[rt] = self.decomposed_reward_dict[rt]

                return state, done, dp
        return None, done, dp

    def send_actions(self, actions, decision_point):
        '''
        <Key name="ImmortalsTop">
            <Value int="0"/>
        </Key>
        <Key name="DecisionPoint">
            <Value int="3"/>
        </Key>
        <Key name="ImmortalsBottom">
            <Value int="0"/>
        </Key>
        <Key name="MarinesBottom">
            <Value int="1"/>
        </Key>
        <Key name="Pylons">
            <Value int="0"/>
        </Key>
        <Key name="BanelingsBottom">
            <Value int="1"/>
        </Key>
        <Key name="MarinesTop">
            <Value int="0"/>
        </Key>
        <Key name="BanelingsTop">
            <Value int="0"/>
        '''
        action_keys = ['MarinesTop', 'BanelingsTop', 'ImmortalsTop', 
                       'MarinesBottom', 'BanelingsBottom', 'ImmortalsBottom', 'Pylons']
        actions_dict = {'DecisionPoint': decision_point}
        for i, ak in enumerate(action_keys):
            actions_dict[ak] = str(int(actions[i]))
#         actions_dict[]
        action_url = "https://script.google.com/macros/s/AKfycbw44fB3fIRMyieO2srq5y1HJKxirL_qvukVCknX4xBXdLD_b0E/exec"
        
        actions = { 'action': json.dumps(actions_dict)} 
        r = requests.post(url = action_url, data = actions)
#         input("post")
    def get_custom_state(self, data):
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
            
            Number of waves 31
        """
        state = np.zeros(32)
        state_keys = ['P2Minerals', 
                      'P2MarinesTopBuilding', 'P2BanesTopBuilding', 'P2ImmortalsTopBuilding', 'P2MarinesBottomBuilding', 'P2BanesBottomBuilding', 'P2ImmortalsBottomBuilding', 'P2PylonsBuilding', 
                      'P1MarinesTopBuilding', 'P1BanesTopBuilding', 'P1ImmortalsTopBuilding', 'P1MarinesBottomBuilding', 'P1BanesBottomBuilding', 'P1ImmortalsBottomBuilding', 'P1PylonsBuilding', 
                      'P2MarinesTop', 'P2BanelingsTop', 'P2ImmortalsTop', 'P2MarinesBottom', 'P2BanelingsBottom', 'P2ImmortalsBottom', 
                      'P1MarinesTop', 'P1BanelingsTop', 'P1ImmortalsTop', 'P1MarinesBottom', 'P1BanelingsBottom', 'P1ImmortalsBottom', 
                      'P2NexusTopHP', 'P2NexusBottomHP', 'P1NexusTopHP', 'P1NexusBottomHP', 'wave'
                     ]
                
        for i, sk in enumerate(state_keys):
            state[i] = data[sk]
        
        state[self.miner_index] -= 1
#         print(state)
#         input()
        if state[self.miner_index] > self.mineral_limiation:
            state[self.miner_index] = self.mineral_limiation
        return state
    
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
        self.decomposed_reward_dict["damge_to_player1_top_2"] = int(data["P1NexusTopDamage"]) - 1
        self.decomposed_reward_dict["damge_to_player1_bottom_2"] = int(data["P1NexusBottomHP"]) - 1
        self.decomposed_reward_dict["damge_to_player2_top_1"] = (int(data["P2NexusTopDamage"]) - 1) * -1
        self.decomposed_reward_dict["damge_to_player2_bottom_1"] = (int(data["P2NexusBottomHP"]) - 1) * -1

        end = False
        dp = False
        
        if data['end'] == '2':
            end = True
#         print(data['DecisionPoint'], self.decision_point)
        if int(data['DecisionPoint']) != self.decision_point:
            self.decision_point = int(data['DecisionPoint'])
            dp = True
    
        return end, dp

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
  