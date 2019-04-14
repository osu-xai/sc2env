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

SCREEN_SIZE = 40
MAP_NAME = 'TugOfWar'
UNIT_TYPES = {
	'SCV': 45,
	'Marine': 1927,
	'Viking': 1928,
	'Colossus': 1926
}

class TugOfWar():
    def __init__(self, reward_types, map_name = None, unit_type = [], generate_xai_replay = False, xai_replay_dimension = 256):
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
              camera_width_world_units = 28,
              
              )
       # print(map_name)
        step_mul_value = 16
        self.sc2_env = sc2_env.SC2Env(
          map_name = map_name,
         # players = [sc2_env.Agent(sc2_env.Race.protoss)],
          agent_interface_format = aif,

          step_mul = step_mul_value,
          game_steps_per_episode = 0,
          score_index = 0,
          visualize = True,)

        
        self.current_obs = None
        self.actions_taken = 0
        self.decomposed_rewards = []

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
        # have not finished the normalization of shield

    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        self.decomposed_rewards = []
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.current_obs = self.sc2_env.step([action])[0]
        self.actions_taken = 0
        np.set_printoptions(threshold=sys.maxsize,linewidth=sys.maxsize)
        observation = self.current_obs
        state = observation[3]['feature_screen']
        state = getOneHotState(state, self.input_screen_features)
        # print(state.shape)
        # print(state)
        # input()
        state = np.reshape(state, (1, -1))
        
        self.end_state = None

        data = self.sc2_env._controllers[0]._client.send(observation = sc_pb.RequestObservation())

        actions_space = self.sc2_env._controllers[0]._client.send(action = sc_pb.RequestAction())
        # look into actions_space

        data = data.observation.raw_data.units
        # print(data)
        # input()
        rewards, _ = self.getRewards(data)
        
        for rt in self.reward_types:
            self.decomposed_reward_dict[rt] = 0
            self.last_decomposed_reward_dict[rt] = 0

        return state

    def getRewards(self, data):
        
        rewards = []
        end = False
        #print(data)
        #input()
        l = len(self.reward_types)
        for x in data:
            if x.unit_type == UNIT_TYPES['SCV']:
                rt = self.reward_types[int(x.shield - 1)]
                if '_Neg' in rt :
                    self.decomposed_reward_dict[rt] = (x.health - 1) * -1
                else:
                    self.decomposed_reward_dict[rt] = x.health - 1
        if x.unit_type == UNIT_TYPES['SCV'] and x.shield ==  'end':
        	end = True
        return rewards, end

    def step(self, action, skip = False):
        end = False

        #have not finished actions yet
        ### ACTION TAKING ###
        if self.actions_taken == 0 and self.check_action(self.current_obs, 12):
            if action == 0:
                action = actions.FUNCTIONS.no_op()
            elif action == 1:
                action = actions.FUNCTIONS.no_op()
            elif action == 2:
                action = actions.FUNCTIONS.no_op()
            elif action == 3:
                action = actions.FUNCTIONS.no_op()
            elif action == 4:
                action = actions.FUNCTIONS.no_op()
            else:
                print("Invalid action: check final layer of network")
                action = actions.FUNCTIONS.no_op()
        else:
            action = actions.FUNCTIONS.no_op()

        self.current_obs = self.sc2_env.step([action])[0]
        observation = self.current_obs
        data = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        data = data.observation.raw_data.units

        rewards, end = self.getRewards(data)

        state = observation[3]['feature_screen']
        state = getOneHotState(state, self.input_screen_features)
        state = np.reshape(state, (1, -1))

        if not skip:
        	for rt in self.reward_types:
        		value_reward = self.decomposed_reward_dict[rt] - self.last_decomposed_reward_dict[rt]
        		self.decomposed_rewards.append(value_reward)

        if end:
            pass
            self.end_state = None
            
        if not skip:
        	self.last_decomposed_reward_dict = self.decomposed_reward_dict
        return state, end

    def register_map(self, map_dir, map_name):
        map_filename = map_name + '.SC2Map'
        class_definition = dict(prefix = map_dir, filename = map_filename, players = 1)
        constructed_class = type(map_name, (pysc2.maps.lib.Map,), class_definition)
        globals()[map_name] = constructed_class

    def get_available_actions(self, obs):
        return obs.observation.available_actions

    def check_action(self, obs, action):
 #       print(action, self.get_available_actions)
        return action in self.get_available_actions(obs)


    """
    def int_map_to_onehot(self, x, vocabulary=None):
        if vocabulary is None:
            # If no vocabulary is known, make a conservative assumption
            vocabulary = set(x.flatten())
        output_shape = (len(vocabulary),) + x.shape
        output_map = np.zeros(shape=output_shape, dtype=float)
        for i, id in enumerate(vocabulary):
            output_map[i][x == id] = 1.
       # print(output_map)
        return output_map
    """
"""
# Unit test for int_map_to_onehot
x = np.zeros((84, 84), dtype=int)
x[1,2] = 49
x[3,10] = 107
x[40:50, 60:70] = 105
assert int_map_to_onehot(x).shape == (4, 84, 84)
assert int_map_to_onehot(x, SIMPLE_SC2_UNITS).shape == (len(SIMPLE_SC2_UNITS), 84, 84)
"""
"""
def normalizeExceptZeros(state):
    state = np.array(state)
    state[state == 0] = 10000000
    print(state)
    state[state == 10000000] = state.min()
    print(state)
    nstate = (state - (state.min())) / (state.max() - state.min())
    print(nstate)
    return nstate
# Unit test for normalizeExceptZeros
s = [0,1,2,3,4,0]
normalizeExceptZeros(s)
"""

#FourTowerSequentialMultiUnit()