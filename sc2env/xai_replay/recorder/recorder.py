import json
import imutil
import numpy as np
from s2clientprotocol import sc2api_pb2 as sc_pb
from pysc2.lib import features
import sys

class XaiReplayRecorder():
    """
    Creates a video and metadata file to support XAI replays UI for user studies
    """
    
    def __init__(self, sc2_env, game_number, env_name, tensor_action_key, tensor_reward_key):
        self.json_filename = env_name + "_" +  str(game_number) + ".json"
        self.video_filename = env_name + "_" +  str(game_number) + ".mp4"
        self.sc2_env = sc2_env
        self.game_clock_tick = 0
        self.frames = []
        self.action_names = ['Top_Left', 'Top_Right', 'Bottom_Left', 'Bottom_Right']
        self.video = imutil.Video(filename=self.video_filename)
        self.decision_point_number = 1
        self.tensor_action_key = tensor_action_key
        self.tensor_reward_key = tensor_reward_key


    def get_observation(self):
        observation = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        return observation

    def save_game_rgb_screen(self, observation): 
        rgb_screen = features.Feature.unpack_rgb_image(observation.observation.render_data.map).astype(np.int32)  
        #print(f"SAVING IMAGE")
        self.video.write_frame(rgb_screen)

    def record_decision_point(self, state, action, q_values, combined_q_values, reward):
        observation = self.get_observation()
        frame_info = {}
        if reward == [[]]:
            frame_info["reward"] = "NA"
        else:
            frame_info["reward"] = reward.item()
        frame_info["action"] = self.action_names[action]
        frame_info["frame_info_type"] = "decision_point"
        frame_info["decision_point_number"] = self.decision_point_number
        frame_info["q_values"] = self.create_rewards_dict_from_tensor(q_values)
        self.decision_point_number += 1
        self.game_clock_tick = 0
        self.gather_common_state(frame_info, observation)
        self.frames.append(frame_info)
        # take picture
        self.save_game_rgb_screen(observation)

    def create_rewards_dict_from_tensor(self, q_values):
        qvalue_info = {}
        # columns are actions, rows are rewards
        for col in range(len(self.tensor_action_key)):
            qvalue_column = {}
            col_name = self.tensor_action_key[col]
            qvalue_info[col_name] = qvalue_column
            for row in range(len(self.tensor_reward_key)):
                reward_name = self.tensor_reward_key[row]
                qvalue_column[reward_name] = q_values[row][col].item() #.item() pulls the value out of a tensor
        print(f"qvalue_info now looks like: {qvalue_info}")
        return qvalue_info

    def gather_common_state(self, frame_info, observation):
        # unit info
        frame_info["game_loop"] = observation.observation.game_loop
        #import pdb; pdb.set_trace()
        
        units = []
        for unit in observation.observation.raw_data.units:
            x = {}
            x["display_type"] = unit.display_type
            x["alliance"] = unit.alliance
            x["tag"] = unit.tag
            x["unit_type"] = unit.unit_type
            x["owner"] = unit.owner
            x["facing"] = unit.facing
            x["radius"] = unit.radius
            x["build_progress"] = unit.build_progress
            x["cloak"] = unit.cloak
            x["is_selected"] = unit.is_selected
            x["is_on_screen"] = unit.is_on_screen
            x["is_blip"] = unit.is_blip
            x["health"] = unit.health
            x["health_max"] = unit.health_max
            x["shield"] = unit.shield
            x["energy"] = unit.energy
            x["is_flying"] = unit.is_flying
            x["is_burrowed"] = unit.is_burrowed
            x["shield_max"] = unit.shield_max
            x["energy_max"] = unit.energy_max
            x["x"] = unit.pos.x
            x["y"] = unit.pos.y
            x["z"] = unit.pos.z
            units.append(x)
        frame_info["units"] = units
    
        

    def record_game_clock_tick(self, state):
        self.game_clock_tick += 1
        if True:
            observation = self.get_observation()
        #if (self.game_clock_tick % 17 == 0):
            frame_info = {}
            frame_info["frame_info_type"] = "clock_tick"
            self.gather_common_state(frame_info, observation)
            self.frames.append(frame_info)
            # take picture
            self.save_game_rgb_screen(observation)

    def record_final_frame_of_action(self, state):
        self.game_clock_tick += 1
        observation = self.get_observation()
        frame_info = {}
        frame_info["frame_info_type"] = "final_frame_of_action"
        self.gather_common_state(frame_info, observation)
        self.frames.append(frame_info)
        # take picture
        self.save_game_rgb_screen(observation)

    def done_recording(self):
        #print("HERE COMES THE JSON")
        #print(self.frames)
        #print(json.dumps(self.frames, separators=(',', ':')))
        f = open(self.json_filename,"w")
        #f.write(json.dumps(self.frames, separators=(',', ':')))
        f.write(json.dumps(self.frames, sort_keys=True, indent=4))
        f.write("\n")
        f.close()

