#!/bin/bash

# set environment variables
source set_env.sh

# start the frontend
npm start&

# start the backend
cd server; python3 server.py > /dev/null&
PYTHON_PID=$!

trap "kill $PYTHON_PID" SIGINT

wait