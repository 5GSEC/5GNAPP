#!/bin/bash

npm start&
cd server; python3 server.py > /dev/null&
PYTHON_PID=$!

trap "kill $PYTHON_PID" SIGINT

wait