#!/bin/bash

set -euxo pipefail

Root=$(realpath "$(dirname "$0")")

cd "$Root"

. /home/compiler/venv/bin/activate

# If remote is down:
# conan remote disable conancenter
# conan export ./gtest "gtest/1.13.0@"

# (
#     cd /tmp && conan install "$Root"  --build=missing
# )

uvicorn main:app --reload --host 0.0.0.0 --port 8001