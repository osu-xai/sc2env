import json
import imutil
import numpy as np
from s2clientprotocol import sc2api_pb2 as sc_pb
from pysc2.lib import features

class XaiReplayRecorder():
    """
    Creates a video and metadata file to support XAI replays UI for user studies
    """
    
    def __init__(self, sc2_env):
        self.sc2_env = sc2_env
        self.game_clock_tick = 0
        self.frames = []
        self.action_names = ['Top_Left', 'Top_Right', 'Bottom_Left', 'Bottom_Right']
        self.video = imutil.VideoMaker(filename="test.mp4")


    def save_game_rgb_screen(self):
        data = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        # it was a similar object returned
        rgb_screen = features.Feature.unpack_rgb_image(data.observation.render_data.map).astype(np.int32)  
        print(f"SAVING IMAGE")
        self.video.write_frame(rgb_screen)

    def record_decision_point(self, state, action, q_values, combined_q_values, reward):
        print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% RECORDING DECISION POINT %%%%%%%%%%%%%%%%%%%%%%%")
        self.game_clock_tick = 0
        frame_info = {}
        if reward == [[]]:
            frame_info["reward"] = "NA"
        else:
            frame_info["reward"] = reward.item()
        frame_info["action"] = self.action_names[action]
        self.frames.append(frame_info)
                
        # take picture
        self.save_game_rgb_screen()


    def record_game_clock_tick(self, state, reward):
        self.game_clock_tick += 1
        if True:
        #if (self.game_clock_tick % 17 == 0):
            frame_info = {}
            frame_info["reward"] = reward.item()
            frame_info["action"] = "no-op"
            self.frames.append(frame_info)
            
            # take picture
            self.save_game_rgb_screen()

    def done_recording(self):
        print("HERE COMES THE JSON")
        print(self.frames)
        print(json.dumps(self.frames, separators=(',', ':')))
        f = open("jsontest.txt","w")
        f.write(json.dumps(self.frames, separators=(',', ':')))
        f.write("\n")
        f.close()

