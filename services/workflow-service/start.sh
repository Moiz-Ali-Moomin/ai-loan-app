#!/bin/sh
set -e

node services/workflow-service/dist/workers/worker.js &
WORKER_PID=$!

node services/workflow-service/dist/api.js &
API_PID=$!

# If either process exits, kill both and exit with its code
wait_and_exit() {
  wait -n 2>/dev/null || wait
  EXIT_CODE=$?
  kill $WORKER_PID $API_PID 2>/dev/null
  exit $EXIT_CODE
}

trap 'kill $WORKER_PID $API_PID 2>/dev/null; exit 0' TERM INT

wait_and_exit
