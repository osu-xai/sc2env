import asyncio
import websockets
#import .proto/session_pb2
#import explanation_pb2
#from .proto import session_pb2
#import proto
from proto.session_pb2 import ScaiiPacket

async def hello(websocket, path):
    sp = ScaiiPacket()

    byt = sp.SerializeToString()
    
    await websocket.send(byt)

    #rec = await websocket.recv()
    #mm = ParseFromString(rec) 
    #print(mm)


if __name__ == "__main__":
    start_server = websockets.serve(hello, 'localhost', 6112)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()