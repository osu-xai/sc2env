import asyncio
import websockets
import os
#import .proto/session_pb2
#import explanation_pb2
#from .proto import session_pb2
#import proto
#from proto.session_pb2 import ScaiiPacket
#import proto.user_study_pb2
#import proto.explanation_pb2
import proto.session_pb2 as pb

REPLAY_DIR_PATH = "../replays"

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


if __name__ == "__main__":
    start_server = websockets.serve(hello, 'localhost', 6112)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()