import os
import random
import numpy as np
from pysc2_util import register_map, unpack_timestep
from pysc2.env import sc2_env
from pysc2.lib import actions

MAP_NAME = 'MacroStrategy'
MAP_SIZE = 64
RGB_SCREEN_SIZE = 256


class MacroStrategyEnvironment():
    def __init__(self):
        self.sc2env = make_sc2env()

    def reset(self):
        # Move the camera in any direction
        # This runs the ResetEpisode trigger built into the map
        action = actions.FUNCTIONS.move_camera([0, 0])
        self.last_timestep = self.sc2env.step([action])[0]

        state, reward, done, info = unpack_timestep(self.last_timestep)
        return state

    # Action space: Choose which of three types of units to build (or, no-op)
    def action_space(self):
        from gym.spaces.discrete import Discrete
        return Discrete(4)

    # Step: Take an action and play the game out 10 seconds
    def step(self, action):
        import pdb; pdb.set_trace()
        if action == 0:
            self.use_custom_ability(3805)
        else:
            # Wait for a while
            self.noop()

        # Wait for a while
        self.noop()

        return unpack_timestep(self.last_timestep)

    def noop(self):
        sc2_action = actions.FUNCTIONS.no_op()
        self.last_timestep = self.sc2env.step([sc2_action])[0]

    def can_attack(self):
        available_actions = self.last_timestep.observation.available_actions
        return actions.FUNCTIONS.Attack_minimap.id in available_actions

    def use_custom_ability(self, ability_id):
        from s2clientprotocol import sc2api_pb2
        from s2clientprotocol import common_pb2
        from s2clientprotocol import spatial_pb2

        target_point = common_pb2.PointI()
        target_point.x = 0
        target_point.y = 0

        action_spatial_unit_command = spatial_pb2.ActionSpatialUnitCommand(target_minimap_coord=target_point)
        action_spatial_unit_command.ability_id = ability_id

        action_spatial = spatial_pb2.ActionSpatial(unit_command=action_spatial_unit_command)
        action = sc2api_pb2.Action(action_feature_layer=action_spatial)
        request_action = sc2api_pb2.RequestAction(actions=[action])
        request = sc2api_pb2.Request(action=request_action)

        client = get_client(self.sc2env)
        client.send_req(request)


def get_client(pysc2_env):
    # Bypass pysc2 and get the Blizzard-made protobuf client
    return pysc2_env._controllers[0]._client


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
                screen=(RGB_SCREEN_SIZE, RGB_SCREEN_SIZE),
                minimap=(RGB_SCREEN_SIZE, RGB_SCREEN_SIZE),
            ),
            action_space=actions.ActionSpace.FEATURES,
        ),
        'map_name': MAP_NAME,
        'step_mul': 170,  # 17 is ~1 action per second
    }
    maps_dir = os.path.join(os.path.dirname(__file__), '..', 'maps')
    register_map(maps_dir, env_args['map_name'])
    return sc2_env.SC2Env(**env_args)

