#!/bin/bash

export PYTHONPATH=~/sc2/sc2env/sc2env/xai_replay/ui/viz/py_backend/proto
cd sc2env/xai_replay/ui/viz/
python -m RangeHTTPServer &
cd ./py_backend/
python python_websocket.py &
echo "The UI is not running at \"http://localhost:8000/\"..."
