import asyncio
import websockets

async def hello(websocket, path):
    got_it = "strinngggg"
    await websocket.send(got_it)

    name = await websocket.recv()
    print(name)

start_server = websockets.serve(hello, 'localhost', 6112)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()