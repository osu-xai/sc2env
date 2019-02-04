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
SCREEN_SIZE = 40
#MAP_NAME = 'FourTowersWithFriendlyUnits'
#MAP_NAME = 'FourTowersWithFriendlyUnitsFixedEnemies'
MAP_NAME = 'FourTowersWithFriendlyUnitsFixedEnemiesFixedPosition'
class FourTowerSequentialFriendlyUnits():
    def __init__(self, reward_types, map_name = None):
        if map_name is None:
            map_name = MAP_NAME
        maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
        print(maps_dir)
        register_map(maps_dir, map_name)
        self.sc2_env = sc2_env.SC2Env(
          map_name = map_name,
          players = [sc2_env.Agent(sc2_env.Race.protoss)],
          agent_interface_format = features.AgentInterfaceFormat(
              feature_dimensions = features.Dimensions(screen = SCREEN_SIZE, minimap = 30),
              action_space = actions.ActionSpace.FEATURES,
              camera_width_world_units = 28
              ),
          step_mul = 16,
          game_steps_per_episode = 0,
          score_index = 0,
          visualize = True,)
 #       lib.renderer_human.zoom(1.5)

        
        self.current_obs = None
        self.actions_taken = 0
        self.decomposed_rewards_all = []
        self.decomposed_rewards = []
        self.decomposed_rewards_mark = 0
        self.signal_of_finished = 1
        self.end_state = None

        self.reward_types = reward_types
        self.decomposed_reward_dict = {}
        for rt in reward_types:
        	self.decomposed_reward_dict[rt] = 0
        self.input_screen_features = {
            "PLAYER_RELATIVE":[1, 3, 4],
            "UNIT_TYPE": [48, 105, 73, 83, 52, 109, 51, 107],
            'HIT_POINT': 0,
            'HIT_POINT_RATIO': 0
        }
        '''
        self.decomposed_reward_dict = {
            'damageToEnemyMarine' : 0,
            'damageByEnemyMarine' : 0,
            'damageToEnemyZergling' : 0,
            'damageByEnemyZergling' : 0,
            'damageToEnemyMarauder' : 0,
            'damageByEnemyMarauder' : 0,
            'damageToEnemyHydralisk' : 0,
            'damageByEnemyHydralisk' : 0,
            'damageToEnemyThor' : 0,
            'damageByEnemyThor' : 0,
            'damageToEnemyUltralisk' : 0,
            'damageByEnemyUltralisk' : 0,
            'damageToFriendZealot' : 0
            }
		'''
    
    def action_space():
        return Discrete(2)

    def observation_space():
        return (84, 84, 1)

    def print_current_alerts(self):
        return self.current_obs[3]

    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        self.decomposed_rewards_all = []
        self.decomposed_rewards = []
        self.decomposed_rewards_mark = 0
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.last_timestep = self.sc2_env.step([action])[0]
        observation = self.unpack_timestep(self.last_timestep)
        self.current_obs = observation
        self.actions_taken = 0
        np.set_printoptions(threshold=np.nan,linewidth=np.nan)
 #       print(observation)
        state = observation[3]['feature_screen']
        player_relative = np.array(state[5])
        player_relative[np.array(state[6]) == 73] = 3
        player_relative[np.array(state[12]) == 1] = 3
        state[5] = player_relative.tolist()
 #       print(type(state))
        state = getOneHotState(state, self.input_screen_features)
        state = np.reshape(state, (1, -1))
        
        self.end_state = None


        data = self.sc2_env._controllers[0]._client.send(observation = sc_pb.RequestObservation())
        self.sc2_env._controllers[0]._client.send(action = sc_pb.RequestAction())


        
        data = data.observation.raw_data.units

        rewards, sof = self.getRewards(data)

        self.signal_of_finished = sof
        
        for key in self.decomposed_reward_dict:
            self.decomposed_reward_dict[key] = 0

        return state
    """
    def getOneHotState(self, state):

        #extend player id
        PLAYER_ID = [1, 3, 16]
        tstate = self.int_map_to_onehot(np.array(state[4]),PLAYER_ID)
        
        #extend unit type
        UNIT_TYPE = [48, 105, 73, 83, 52, 109, 51, 107]
        tstate = np.append(tstate, self.int_map_to_onehot(np.array(state[6]),UNIT_TYPE), axis=0)
        
        #append unit hit point
        tstate = np.append(tstate, self.normalizeExceptZeros(state[8],
                                                             (0, 500)), axis=0)

        #append unit hit point ratio
        SCALE = 255
        hit_point_ratio = state[9] / SCALE
        hit_point_ratio = np.reshape(hit_point_ratio, (1, SCREEN_SIZE, SCREEN_SIZE))
        tstate = np.append(tstate, hit_point_ratio, axis=0)
        '''
        #extend unit density
        MAX_UNIT_DENSITY = 4
        unit_density = np.clip(state[14] / MAX_UNIT_DENSITY, 0, 1)
        unit_density = np.reshape(unit_density, (1, SCREEN_SIZE, SCREEN_SIZE))
        tstate = np.append(tstate, unit_density, axis=0)
        '''
       # print(tstate)
       # print(tstate.shape)
        return tstate

    def normalizeExceptZeros(self, state, certainRange = None):
        state = np.array(state)

        if certainRange is None:
 #           state[state == 0] = state.min(state[np.nonzero(state)])
            nstate = (state - state.min()) / (state.max() - state.min())
        else:
            nstate = (state - certainRange[0]) / (certainRange[1] - certainRange[0])
        nstate = np.reshape(nstate, (1, SCREEN_SIZE, SCREEN_SIZE))
        return nstate
    """
    def getRewards(self, data):
        
        rewards = []

        l = len(self.reward_types)
        for x in data:
            if x.shield == 199:
                sof = x.health
            elif x.shield > 100:
                rt = self.reward_types[int(x.shield - 101)]
                #print(x.shield)
                if 'damageToEnemy' in rt:
                    self.decomposed_reward_dict[rt] = x.health - 1
                else:
                    self.decomposed_reward_dict[rt] = (x.health - 1) * -1
        return rewards, sof
        
    def noop(self):
        return actions.FUNCTIONS.no_op()

    def step(self, action):
        done = False
        dead = False

        ### ACTION TAKING ###
    #    print(action)
        if self.actions_taken == 0 and self.check_action(self.current_obs, 12):
            if action == 0:
                action = actions.FUNCTIONS.Attack_screen("now", [0,0])
            elif action == 1:
                action = actions.FUNCTIONS.Attack_screen("now", [39,0])
            elif action == 2:
                action = actions.FUNCTIONS.Attack_screen("now", [0,39])
            elif action == 3:
                action = actions.FUNCTIONS.Attack_screen("now", [39,39])
            elif action == 4:
                action = actions.FUNCTIONS.no_op()
            else:
                print("Invalid action: check final layer of network")
                action = actions.FUNCTIONS.no_op()
        else:
            action = actions.FUNCTIONS.no_op()
 #           print(self.actions_taken == 0, self.check_action(self.current_obs, 12))
   #     print(action)
        ####################

        ### STATE PREPARATION ###

        self.last_timestep = self.sc2_env.step([action])[0]

        observation = self.unpack_timestep(self.last_timestep)
        self.current_obs = observation
        #########################

        ### REWARD PREPARATION AND TERMINATION ###

        data = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        data = data.observation.raw_data.units

        rewards, sof = self.getRewards(data)

        state = observation[3]['feature_screen']
        player_relative = np.array(state[5])
        player_relative[np.array(state[6]) == 73] = 3
        player_relative[np.array(state[12]) == 1] = 3
        state[5] = player_relative.tolist()
        state = getOneHotState(state, self.input_screen_features)
        state = np.reshape(state, (1, -1))

        #print(state.shape)
        self.decomposed_rewards_all.append([])
        la = len(self.decomposed_rewards_all)
        for key in self.decomposed_reward_dict:
            self.decomposed_rewards_all[la - 1].append(self.decomposed_reward_dict[key])
 #       print(self.signal_of_finished,sof)
        if self.signal_of_finished != sof:
            done = True
            
            if sof == 1:
                dead = True
            else:
                dead = False
            self.decomposed_rewards.append([])
            
            
            for i in range(len(self.reward_types)):
                l = len(self.decomposed_rewards)
                la = len(self.decomposed_rewards_all)
                if not dead:
                    self.decomposed_rewards[l - 1].append(
                        self.decomposed_rewards_all[la - 1][i] - self.decomposed_rewards_all[self.decomposed_rewards_mark][i]
                        )
                else:
                    self.decomposed_rewards[l - 1].append(
                        self.decomposed_rewards_all[la - 2][i] - self.decomposed_rewards_all[self.decomposed_rewards_mark][i]
                        )
            self.decomposed_rewards_mark = la - 1
            
        self.signal_of_finished = sof
        '''                                                                                       
        if len(state) < 41:
            current_len_state = len(state)
            for x in range(current_len_state, 41):
                state.append(0.0)
#        print(done,dead)
        '''
        if dead:

            state = observation[3]['feature_screen']
            player_relative = np.array(state[5])
            player_relative[np.array(state[6]) == 73] = 3
            player_relative[np.array(state[12]) == 1] = 3
            state[5] = player_relative.tolist()

            agent_units_position = np.array(state[6]) == 83
            
            for i, s in enumerate(state):
                nps = np.array(s)
                nps[agent_units_position] = 0
                state[i] = nps.tolist()
            state = getOneHotState(state,self.input_screen_features)
            state = np.reshape(state, (1, -1))

            self.end_state = state

        return state, done, dead

    def register_map(self, map_dir, map_name):
        map_filename = map_name + '.SC2Map'
        class_definition = dict(prefix = map_dir, filename = map_filename, players = 1)
        constructed_class = type(map_name, (pysc2.maps.lib.Map,), class_definition)
        globals()[map_name] = constructed_class


    def unpack_timestep(self, timestep):  
        observation = timestep
 #       print(timestep.observation.feature_minimap[3])
 #       state = timestep.observation.feature_screen[6]
 #       reward = timestep.observation.score_cumulative[0]
 #       done = timestep.last()
#        info = {}
        return observation#, state, reward, done, info

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
