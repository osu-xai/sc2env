
import os
import numpy as np
import proto.explanation_pb2 as expl_pb

reward_block_spec = {}
reward_block_spec['all'] = [0,0]
reward_block_spec['damageToWeakEnemyGroup'] = [0,1]
reward_block_spec['destoryToWeakEnemyGroup'] = [0,2]
reward_block_spec['damageToStrongEnemyGroup'] = [1,0]
reward_block_spec['destoryToStrongEnemyGroup'] = [1,1]
reward_block_spec['damageToWeakFriendGroup'] = [1,2]
reward_block_spec['destoryToWeakFriendGroup'] = [2,0]
reward_block_spec['damageToStrongFriendGroup'] = [2,1]
reward_block_spec['destoryToStrongFriendGroup'] = [2,2]
action_offset_spec = {}
action_offset_spec[2] = [0,20]
action_offset_spec[1] = [0,0]
action_offset_spec[0] = [20,0]
action_offset_spec[3] = [20,20]

REPLAY_DIR_PATH = "../replays"

explanation_points_array = []
async def hello(websocket, path):
    replay_files = grab_replay_files(REPLAY_DIR_PATH)

    rc = pb.ReplayChoiceConfig(replay_filenames=replay_files, user_study_mode=False)

    scaii_packet = pb.ScaiiPacket(replay_choice_config=rc)
    #session_config = pb.SC2ReplaySessionConfig()
    #sp.replay_session_config = session_config
    #rc = scaii_packet.replay_choice_config.add()


    #file_names = ["test_1520x1280"]
    #rc.replay_filenames = file_names
    #rc = pb.ReplayChoiceConfig()


    #rc.replay_filenames = file_names
    #rc.user_study_mode = False
    #filename = "test_1520x1280" #everything but the filetype

    #scaii_packet.replay_choice_config = rc

    byt = scaii_packet.SerializeToString()
    await websocket.send(byt)

    while True:
    

        response_bytes = file_choice_packet = await websocket.recv()
        responsePacket = pb.ScaiiPacket()
        responsePacket.ParseFromString(response_bytes)
        #enum UserCommandType {
		#  NONE = 0;
		#  EXPLAIN = 1;
		#  POLL_FOR_COMMANDS= 5;
		#  SET_SPEED = 8;
		#  SELECT_FILE = 9;
	    #}
        #import pdb; pdb.set_trace()
        if responsePacket.HasField('user_command'):
            if responsePacket.user_command.command_type == 9:
                args = responsePacket.user_command.args
                filename = args[0]
                
                json = load_json_from_replay_datafile(filename, REPLAY_DIR_PATH)
                if json is None:
                    print("ERROR - when grabbing json file")
                else:
                    rsc = pb.SC2ReplaySessionConfig(json_data=json)
                    scaii_packet = pb.ScaiiPacket(replay_session_config=rsc)
                    byt = scaii_packet.SerializeToString()
                    await websocket.send(byt)

        
        #print [method for method in dir(responsePacket) if callable(getattr(responsePacket, method))]
        print(responsePacket)

def load_json_from_replay_datafile(filename, replay_dir_path):
    # files will be in ../replays
    # navigate to ../replays and retrive file with same name as filename

    filename_with_extension = filename + '.json'

    if not os.path.exists(replay_dir_path):
        print("ERROR: path to replays does not exist!")
        return

    files_in_dir = os.listdir(replay_dir_path)
    for json_file in files_in_dir:
        if json_file == filename_with_extension:
            json_path = os.path.join(replay_dir_path, filename_with_extension)
            f = open(json_path)
            data = f.read()
            f.close()
            return data

    print("ERROR: file not found in replays folder!")
    return

def grab_replay_files(replay_dir_path):
    if not os.path.exists(replay_dir_path):
        print("ERROR: path to replays does not exist!")
        return []

    replay_files = []
    files_in_dir = os.listdir(replay_dir_path)
    for json_file in files_in_dir:
        if json_file.endswith(".json"):
            no_extension = os.path.splitext(json_file)[0]
            replay_files.append(no_extension)
            
    if (len(replay_files) == 0):
        print("ERROR: In replays directory no files found or no files found of type '.json'")
    return replay_files

def generate_bogus_saliencies(action, reward_name):
    s = np.zeros(shape = (40,40,3))
    value_map = [0.33,0.66,1.0]
    block_spec = reward_block_spec[reward_name]
    action_offset_x = action_offset_spec[action][0]
    action_offset_y = action_offset_spec[action][1]
    matching_x_range = [action_offset_x + block_spec[0]*6, action_offset_x + block_spec[0]*6 + 5]
    matching_y_range = [action_offset_y + block_spec[1]*6, action_offset_y + block_spec[1]*6 + 5]
    #print(f"action {action}, reward_name {reward_name}, matching_x_range {matching_x_range}, matching_y_range {matching_y_range}")
    
    for y in range(40):
        for x in range(40):
            for z in range(3):
                if (x >= matching_x_range[0]) and (x <= matching_x_range[1]) and (y >= matching_y_range[0]) and (y <= matching_y_range[1]):
                    s[x,y,z] = value_map[z]
    # for z in range(3):
    #     print("\n\n")
    #     for y in range(40):
    #         print("\n")
    #         for x in range(40):
    #             print(f"{s[x][y][z]} ", end = '')
    return s

def record_saliency_for_decision_point(saliencies, dp, step):
    expl_point = expl_pb.ExplanationPoint()
    expl_point.title = dp
    expl_point.step = step
    expl_point.description = "someDescription"
    layer_names = ['Friend/Enemy', 'Unit Type' , 'HP']
    action_names = ['Attack Q1','Attack Q2','Attack Q3','Attack Q4']

    # map the saliency info from this point into an ExplanationPoint protobuf
    #
    # saliencies' keys are quadrant names, values are dictionaries where keys are reward names or "all" and values are ndarray of shape 40x40x 3 where 3 is the count of saliency flavors: frenemy, unit_type , hp
    #(Pdb) type(saliencies) == <class 'dict'>
    #(Pdb) saliencies.keys() == dict_keys([0, 1, 2, 3])
    for j, reward_saliencies_dict in saliencies.items():
        #(Pdb) type(saliencies[0]) == <class 'dict'>
        #(Pdb) saliencies[0].keys() == dict_keys(['all', 'damageToWeakEnemyGroup', 'destoryToWeakEnemyGroup', 'damageToStrongEnemyGroup', 'destoryToStrongEnemyGroup', 'damageToWeakFriendGroup', 'destoryToWeakFriendGroup', 'damageToStrongFriendGroup', 'destoryToStrongFriendGroup'])
        for reward_name, layers_info in reward_saliencies_dict.items():
            #(Pdb) type(saliencies[0]['all']) == <class 'numpy.ndarray'>
            #(Pdb) saliencies[0]['damageToWeakEnemyGroup'].shape == (40, 40, 3)

            key = f"{step}_{action_names[j]}_{reward_name}"
            layer_count = layers_info.shape[2] # 3 where shape is (40,40,3)
            print(key)
            for i in range(0,layer_count):
                layer_proto = expl_point.saliency.saliency_map[key].layers.add()
                layer_info_x_by_y_by_1 = layers_info[::,::,i:i+1:]
                layer_info_row_major = layer_info_x_by_y_by_1.reshape(-1)
                #print(f"length of row_major info is {layer_info_row_major.size}")

                #layer_proto = expl_pb.Layer()
                layer_proto.cells.extend(layer_info_row_major)
                layer_proto.width = layers_info.shape[0] # 40
                layer_proto.height = layers_info.shape[1] # 40
                layer_proto.name = layer_names[i]
                print(f"layer info is name {layer_names[i]} width {layer_proto.width} height { layer_proto.height }")
    explanation_points_array.append(expl_point)

def persist(eps):
    expl_points = expl_pb.ExplanationPoints()
    expl_points.explanation_points.extend(eps)
    data = expl_points.SerializeToString()
    path = os.path.join(REPLAY_DIR_PATH, "game6_1024.expl")
    output_file = open(path,"wb")
    output_file.write(data)

def generate_data():
    if not os.path.exists(REPLAY_DIR_PATH):
        print("ERROR: path to replays does not exist!")
        return []
    dps = ["dp1", "dp2", "dp3", "dp4", "dp5", "dp6"]
    steps = [0,28,56,102,130,159]
    for i in range(6):
        actions = [0,1,2,3]
        saliencies = {}
        reward_names = ['all', 'damageToWeakEnemyGroup', 'destoryToWeakEnemyGroup', 'damageToStrongEnemyGroup', 'destoryToStrongEnemyGroup', 'damageToWeakFriendGroup', 'destoryToWeakFriendGroup', 'damageToStrongFriendGroup', 'destoryToStrongFriendGroup']
        for action in actions:
            action_saliencies = {}
            for reward_name in reward_names:
                s = generate_bogus_saliencies(action, reward_name)
                action_saliencies[reward_name] = s
            saliencies[action] = action_saliencies
        record_saliency_for_decision_point(saliencies, dps[i], steps[i])
    persist(explanation_points_array)
    # populate protobuf

    # persist protobuf

if __name__ == "__main__":
    generate_data()