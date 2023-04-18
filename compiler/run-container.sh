#!/bin/bash

set -euxo pipefail

Root=$(realpath "$(dirname "$0")")

docker run -it \
    --publish 8001:8001 \
    --name "noxitu_compiler_service" \
    -v "$Root/app:/home/compiler/app2" \
    "noxitu/compiler"
