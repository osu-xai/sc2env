import numpy as np
from pysc2.env import environment
from pysc2.env import sc2_env
from pysc2.agents.base_agent import BaseAgent
from pysc2.lib import features, actions
import imutil
from imutil import VideoMaker

def init_absl():
    import sys
    import absl
    absl.flags.FLAGS(sys.argv)


def make_env():
    init_absl()
    env_args = {
        'agent_interface_format': sc2_env.AgentInterfaceFormat(
            feature_dimensions=sc2_env.Dimensions(
                screen=(32,32),
                minimap=(32,32)
            ),
            rgb_dimensions=sc2_env.Dimensions(
                screen=(256,256),
                minimap=(256,256),
            ),
            action_space=actions.ActionSpace.FEATURES,
        ),
        'map_name': 'DefeatRoachesAndHydra',
    }
    return sc2_env.SC2Env(**env_args)


class DumbAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.idx = 0

    def step(self, obs):
        super().step(obs)
        if self.idx == 0:
            print('Selecting army...')
            action = actions.FUNCTIONS.select_army("select")
        elif self.idx == 1:
            target = [1, 10]
            print('Moving to {}...'.format(target))
            action = actions.FUNCTIONS.Move_screen("now", target)
        else:
            action = actions.FUNCTIONS.no_op()
        self.idx += 1
        return action


def main():
    env = make_env()
    agent = DumbAgent()
    agent.setup(env.observation_spec(), env.action_spec())
    timestep = env.reset()[0]
    agent.reset()

    vid_rgb_screen = VideoMaker('rgb_screen')
    vid_rgb_map = VideoMaker('rgb_minimap')
    vid_feat_screen = VideoMaker('feature_screen')
    vid_feat_map = VideoMaker('feature_minimap')
    try:
        while True:
            action = agent.step(timestep)
            timestep = env.step([action])[0]

            vid_rgb_map.write_frame(timestep.observation.rgb_minimap)
            vid_rgb_screen.write_frame(timestep.observation.rgb_screen)
            vid_feat_map.write_frame(timestep.observation.feature_minimap)
            vid_feat_screen.write_frame(timestep.observation.feature_screen)
    finally:
        del env
        vid_rgb_screen.finish()
        vid_rgb_map.finish()
        vid_feat_screen.finish()
        vid_feat_map.finish()


if __name__ == '__main__':
    main()
