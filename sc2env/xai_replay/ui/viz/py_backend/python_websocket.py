import asyncio
import websockets
#import .proto/session_pb2
#import explanation_pb2
#from .proto import session_pb2
#import proto
#from proto.session_pb2 import ScaiiPacket
import proto.session_pb2 as pb

async def hello(websocket, path):
    rc = pb.ReplayChoiceConfig(replay_filenames=["test_1520x1280", "Test_2"], user_study_mode=False)

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

    # rec = await websocket.recv()
    # mm = ParseFromString(rec) 
    # print(mm)


if __name__ == "__main__":
    start_server = websockets.serve(hello, 'localhost', 6112)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()