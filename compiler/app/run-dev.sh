#!/bin/bash

set -euxo pipefail

Root=$(realpath "$(dirname "$0")")

cd "$Root"

. /home/compiler/venv/bin/activate

# If remote is down:
# conan remote disable conancenter
# conan export ./gtest "gtest/1.13.0@"

# ( cd /tmp && conan install 'opencv/4.5.5@#6e269cd47b943e533827cdea4d498cf1' )
# ( cd /tmp && conan install "$Root" )
( cd /tmp && conan install "$Root" --build=missing )

export LD_LIBRARY_PATH=/home/compiler/.conan/data/opencv/4.5.5/_/_/build/e22db7dfa4570fdbce29a80d4087d8a0cf2a8ae9/build/Release/lib/

uvicorn main:app --reload --host 0.0.0.0 --port 8001