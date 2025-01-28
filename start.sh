#!/bin/bash

npm start&
cd src; python server.py > /dev/null&
PYTHON_PID=$!

trap "kill $PYTHON_PID" SIGINT

wait