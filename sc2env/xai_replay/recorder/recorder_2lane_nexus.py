import json
import imutil
import numpy as np
import time
import os
from s2clientprotocol import sc2api_pb2 as sc_pb
#import explanation_pb2 as expl_pb 
from pysc2.lib import features
import sys
REPLAY_DIR_PATH = "../sc2env/sc2env/xai_replay/ui/viz/replays"

class XaiReplayRecorder2LaneNexus():
    """
    Creates a video and metadata file to support XAI replays UI for user studies
    """
    
    def __init__(self, sc2_env, game_number, env_name, action_component_names, replay_dimension = 256):
        time_string = "{}".format(int(time.time()))

        self.game_number = game_number
        self.json_pathname = os.path.join(REPLAY_DIR_PATH,"game_" + str(self.game_number) + "_" +  time_string + "_" + str(replay_dimension) + ".json")
        self.video_pathname = os.path.join(REPLAY_DIR_PATH,"game_" + str(self.game_number) + "_" +  time_string + "_" + str(replay_dimension) + ".mp4")
        self.saliency_pathname = os.path.join(REPLAY_DIR_PATH,"game_" + str(self.game_number) + "_" +  time_string + "_" + str(replay_dimension) + ".expl")

        self.sc2_env = sc2_env
        #self.game_clock_tick = 0
        self.frames = [] 
        self.action_component_names = action_component_names
        self.video = imutil.Video(filename=self.video_pathname)
        self.decision_point_number = 1
        self.explanation_points_array = []
        self.current_wave_number = 0
        self.jpg_number = 0

    def save_jpg(self):
        observation = self.get_observation()
        self.save_game_rgb_screen(observation)

    def get_observation(self):
        observation = self.sc2_env._controllers[0]._client.send(observation=sc_pb.RequestObservation())
        return observation

    def save_game_rgb_screen(self, observation): 
        # print("fetching RGB screen")
        rgb_screen = features.Feature.unpack_rgb_image(observation.observation.render_data.map).astype(np.int32)  
        # print(f"SAVING IMAGE")
        # imutil.show(rgb_screen, filename="twoLane" + str(self.jpg_number) + ".jpg")
        #imutil.show(self.last_timestep.observation['rgb_screen'], filename="test.jpg")
        self.video.write_frame(rgb_screen, normalize=False)

    def record_decision_point(self, action_p1, action_p2, state_p1, state_p2, cumulative_rewards):
        # print("record_decision_point...")
        observation = self.get_observation()
        frame_info = {}
        # if rewards == [[]]:
        #     frame_info["rewards"] = "NA"
        # else:
        #     frame_info["rewards"] = rewards
        if cumulative_rewards == [[]]:
            frame_info["cumulative_rewards"] = "NA"
        else:
            frame_info["cumulative_rewards"] = cumulative_rewards
        
        frame_info["action_component_names"] = self.action_component_names
        print("action p1: " + str(action_p1))
        print("action p1: " + str(action_p2))
        print("state p2: " + str(state_p1))
        print("state p2: " + str(state_p2))
        input
        # frame_info["action_p1"] = create_action_dict(action_p1)
        # frame_info["action_p2"] = create_action_dict(action_p2)
        # frame_info["state_p1"] = create_state_dict(state_p1)
        # frame_info["state_p2"] = create_state_dict(state_p2)

        frame_info["frame_info_type"] = "decision_point"
        frame_info["decision_point_number"] = self.decision_point_number
        self.decision_point_number += 1
        self.gather_common_state(frame_info, observation)
        self.frames.append(frame_info)
        # take picture
        self.save_game_rgb_screen(observation)


    def gather_common_state(self, frame_info, observation):
        # unit info
        frame_info["game_loop"] = observation.observation.game_loop
        #import pdb; pdb.set_trace()
        frame_info["frame_number"] = len(self.frames)
        units = []
        # wave_number = get_wave_number(observation.observation.raw_data.units)
        # frame_info["wave_number"] = wave_number
        # if self.current_wave_number != wave_number:
        #     frame_info["start_of_wave"] = True
        #     self.current_wave_number = wave_number
        # else:
        #     frame_info["start_of_wave"] = False
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
    
        

    def record_game_clock_tick(self, cumulative_rewards):
        observation = self.get_observation()
        frame_info = {}
        frame_info["cumulative_rewards"] = clone_rewards_dict(cumulative_rewards)
        frame_info["frame_info_type"] = "clock_tick"
        self.gather_common_state(frame_info, observation)
        self.frames.append(frame_info)
        # take picture
        self.save_game_rgb_screen(observation)

    # def record_final_frame_of_action(self, state):
    #     self.game_clock_tick += 1
    #     observation = self.get_observation()
    #     frame_info = {}
    #     frame_info["frame_info_type"] = "final_frame_of_action"
    #     self.gather_common_state(frame_info, observation)
    #     self.frames.append(frame_info)
    #     # take picture
    #     self.save_game_rgb_screen(observation)

    def done_recording(self):
        #print("HERE COMES THE JSON")
        #print(self.frames)
        #print(json.dumps(self.frames, separators=(',', ':')))
        f = open(self.json_pathname,"w")
        #f.write(json.dumps(self.frames, separators=(',', ':')))
        f.write(json.dumps(self.frames, sort_keys=True, indent=4))
        f.write("\n")
        f.close()
        # expl_points_pb = expl_pb.ExplanationPoints(explanation_points = self.explanation_points_array)

        expl_points_pb = 0
        data = expl_points_pb.SerializeToString()
        output_file = open(self.saliency_pathname,"wb")
        output_file.write(data)

    # def record_saliency_for_decision_point(self, saliencies):
    #     # since we already appended the corresponding frame to the frames list in record_decision_point, 
    #     # we need to subtract 1 here to reference that frame (which is == game clock cycle == "step" in UI terms)
    #     step_plus_one = len(self.frames)
    #     step = step_plus_one - 1
    #     expl_point = expl_pb.ExplanationPoint()
    #     expl_point.title = "someTitle"
    #     expl_point.description = "someDescription"
    #     expl_point.step = step
    #     layer_names = ['Friend/Enemy', 'Unit Type' , 'HP']
    #     action_names = ['Attack Q1','Attack Q2','Attack Q3','Attack Q4']
    #     # map the saliency info from this point into an ExplanationPoint protobuf
    #     #
    #     # saliencies' keys are quadrant names, values are dictionaries where keys are reward names or "all" and values are ndarray of shape 40x40x 3 where 3 is the count of saliency flavors: frenemy, unit_type , hp
    #     #(Pdb) type(saliencies) == <class 'dict'>
    #     #(Pdb) saliencies.keys() == dict_keys([0, 1, 2, 3])
    #     for action_index, reward_saliencies_dict in saliencies.items():
    #         #(Pdb) type(saliencies[0]) == <class 'dict'>
    #         #(Pdb) saliencies[0].keys() == dict_keys(['all', 'damageToWeakEnemyGroup', 'destoryToWeakEnemyGroup', 'damageToStrongEnemyGroup', 'destoryToStrongEnemyGroup', 'damageToWeakFriendGroup', 'destoryToWeakFriendGroup', 'damageToStrongFriendGroup', 'destoryToStrongFriendGroup'])
    #         for reward_name, layers_info in reward_saliencies_dict.items():
    #             #(Pdb) type(saliencies[0]['all']) == <class 'numpy.ndarray'>
    #             #(Pdb) saliencies[0]['damageToWeakEnemyGroup'].shape == (40, 40, 3)
    #             action_name = action_names[action_index]
    #             key = f"{step}_{action_name}_{reward_name}"
    #             print(f"saliencyId is {key}")
    #             layer_count = layers_info.shape[2] # 3 where shape is (40,40,3)
                
    #             for i in range(0,layer_count):
    #                 layer_proto = expl_point.saliency.saliency_map[key].layers.add()
    #                 layer_info_x_by_y_by_1 = layers_info[::,::,i:i+1:]
    #                 layer_info_row_major = layer_info_x_by_y_by_1.reshape(-1)
    #                 #print(f"length of row_major info is {layer_info_row_major.size}")
    #                 layer_proto.cells.extend(layer_info_row_major)
    #                 layer_proto.width = layers_info.shape[0] # 40
    #                 layer_proto.height = layers_info.shape[1] # 40
    #                 layer_proto.name = layer_names[i]
    #                 #print(f"layer name is {layer_names[i]}")
    #     self.explanation_points_array.append(expl_point)

def clone_rewards_dict(rd):
    result = {}
    for key, val in rd.items():
        print(f"{key} : {val}")
        result[key] = val
    return result
