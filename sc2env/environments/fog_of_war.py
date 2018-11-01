import time
import os
import random
import numpy as np
import imutil

from pysc2.env import sc2_env
from pysc2.lib import actions

from sc2env.pysc2_util import register_map


# These parameters are adjustable without changing the .SC2Map
MAP_NAME = 'FogOfWar'
MAP_SIZE = 64
RGB_SCREEN_WIDTH = 400
RGB_SCREEN_HEIGHT = 240


# These parameters are based on the .SC2Map triggers
# Open the map in the Galaxy editor for details
MAX_STEPS = 10
unit_id_to_name = {
    1922: "CustomUnitCommandCenter",
    1923: "CustomUnitPaper",
    1924: "CustomUnitRock",
    1925: "CustomUnitScissors",
}
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
    1: "Paper (reserves)",
    2: "Paper (front)",
    3: "Rock (reserves)",
    4: "Rock (front)",
    5: "Scissors (reserves)",
    6: "Scissors (front)",
    7: "Scout",
    8: "Counterintelligence",
}


class FogOfWarMultiplayerEnvironment():
    """
    This environment pits two agents against each other in a game of
    incomplete information. Each agent trades off between building more
    units, and gathering information about the enemy's units.
    """
    def __init__(self, render=False, video_filename=None, verbose=False, num_players=2):
        if video_filename:
            render = True
        self.render = render
        self.num_players = num_players
        self.sc2env = make_sc2env(num_players, render=render)
        self.video = None
        if video_filename:
            self.video = imutil.VideoMaker(filename=video_filename)
        self.verbose = verbose

    def reset(self):
        self.step_sc2env()
        self.steps = 0
        state, reward, done, info = self.unpack_state()
        return state

    def action_space(self):
        from gym.spaces.discrete import Discrete
        return Discrete(len(action_to_name))

    # Step: Take an action and play the game out for ~10 seconds
    def step(self, action_player1, action_player2=None):
        if self.game_over():
            print('Game is over, cannot take further actions')
            return

        if self.verbose:
            print('Taking action_player1={}, action_player2={} at t={}'.format(
                action_player1, action_player2, self.steps))
        self.steps += 1

        if self.steps >= MAX_STEPS:
            if self.verbose:
                print('Game has reached limit of {} actions: simulating endgame'.format(MAX_STEPS))
            self.step_until_endgame()
        else:
            if action_player1 > 0:
                player1_ability_id = action_to_ability_id[action_player1]
                self.use_custom_ability(player1_ability_id, 1)
            if self.num_players > 1 and action_player2 > 0:
                player2_ability_id = action_to_ability_id[action_player2]
                self.use_custom_ability(player2_ability_id, 2)
            self.step_sc2env()
        if self.video:
            screenshot = self.unpack_state()[0][3]
            for _ in range(10):
                self.video.write_frame(screenshot)
        return self.unpack_state()

    # Convert the SC2Env timestep into a Gym-style tuple
    def unpack_state(self):
        obs = self.last_timestep.observation
        feature_map = np.array(obs.feature_minimap)
        feature_screen = np.array(obs.feature_screen)
        rgb_map = None
        rgb_screen = None
        if self.render:
            rgb_map = np.array(obs.rgb_minimap)
            rgb_screen = np.array(obs.rgb_screen)
        state = (feature_map, feature_screen, rgb_map, rgb_screen)

        reward = 0
        done = self.game_over()
        if done:
            reward = 1 if self.first_player_victory() else -1
            print('Finishing game at step {}'.format(self.steps))
        info = {}
        return state, reward, done, info

    def game_over(self):
        # SC2Env Game States
        # 0: first timestep, 1: other, 2: last timestep
        return self.sc2env._state == 2

    def first_player_victory(self):
        return self.sc2env._obs[0].player_result[0].result != 2

    def step_sc2env(self):
        if self.verbose:
            print('step_sc2env() state={}'.format(self.sc2env._state))
        # Step forward to synchronize clients
        start_time = time.time()
        for i in range(self.num_players):
            self.sc2env._controllers[i].step(count=1)
            self.sc2env._controllers[i].observe()

        noop = actions.FUNCTIONS.no_op()
        action_list = [noop] * self.num_players
        timesteps = self.sc2env.step(action_list)
        self.last_timestep = timesteps[0]
        if self.verbose:
            print('SC2Env step took {:.02f} sec'.format(time.time() - start_time))

    def step_until_endgame(self):
        if self.video:
            self.sc2env._step_mul = 3
        while not self.game_over():
            self.step_sc2env()
            if self.video:
                screenshot = self.unpack_state()[0][3]
                self.video.write_frame(screenshot)

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
        if self.verbose:
            print('Calling client.send_req for player_id {}'.format(player_id))
        if self.sc2env._state == 2:
            print('Game is over, cannot send action')
            return
        client.send_req(request)


# Create the low-level SC2Env object, which we wrap with
#  a high level Gym-style environment
def make_sc2env(num_players, render=False):
    if num_players == 1:
        players = [sc2_env.Agent(sc2_env.Race.terran)]
    else:
        players = [sc2_env.Agent(sc2_env.Race.terran), sc2_env.Agent(sc2_env.Race.terran)]

    if render:
        interface = sc2_env.AgentInterfaceFormat(
            feature_dimensions=sc2_env.Dimensions(
                screen=(MAP_SIZE, MAP_SIZE),
                minimap=(MAP_SIZE, MAP_SIZE)
            ),
            rgb_dimensions=sc2_env.Dimensions(
                screen=(RGB_SCREEN_WIDTH, RGB_SCREEN_HEIGHT),
                minimap=(RGB_SCREEN_WIDTH, RGB_SCREEN_HEIGHT),
            ),
            action_space=actions.ActionSpace.FEATURES)
    else:
        interface = sc2_env.AgentInterfaceFormat(
            feature_dimensions=sc2_env.Dimensions(
                screen=(MAP_SIZE, MAP_SIZE),
                minimap=(MAP_SIZE, MAP_SIZE)
            ), action_space=actions.ActionSpace.FEATURES)

    env_args = {
        'agent_interface_format': interface,
        'map_name': MAP_NAME,
        'step_mul': 85,  # 17 is ~1 action per second
        'players': players,
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'], players=num_players)
    return sc2_env.SC2Env(**env_args)


class FogOfWarEnvironment(FogOfWarMultiplayerEnvironment):
    """
    The single-player version, against a scripted opponent
    """
    def __init__(self, *args, **kwargs):
        kwargs['num_players'] = 1
        super().__init__(*args, **kwargs)

