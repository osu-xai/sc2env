import json

class XaiReplayRecorder():
    """
    Creates a video and metadata file to support XAI replays UI for user studies
    """
    
    def __init__(self):
        self.game_clock_tick = 0
        self.frames = []
        self.action_names = ['Top_Left', 'Top_Right', 'Bottom_Left', 'Bottom_Right']


    def record_decision_point(self, state, action, q_values, combined_q_values, reward):
        print(f"reward looks like this {reward} and type is {type(reward)}")
        self.game_clock_tick = 0
        frame_info = {}
        if reward == [[]]:
            frame_info["reward"] = "NA"
        else:
            frame_info["reward"] = reward.item()
        frame_info["action"] = self.action_names[action]
        self.frames.append(frame_info)
        
        # take picture


    def record_game_clock_tick(self, state, reward):
        self.game_clock_tick += 1
        if (self.game_clock_tick % 17 == 0):
            frame_info = {}
            frame_info["reward"] = reward.item()
            frame_info["action"] = "no-op"
            self.frames.append(frame_info)
            #take picture

    def done_recording(self):
        print("HERE COMES THE JSON")
        print(self.frames)
        print(json.dumps(self.frames, separators=(',', ':')))
        f = open("jsontest.txt","w")
        f.write(json.dumps(self.frames, separators=(',', ':')))
        f.write("\n")
        f.close()