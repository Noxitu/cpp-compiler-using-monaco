#!/bin/bash

set -euxo pipefail

Root=$(realpath "$(dirname "$0")")

docker build "$Root" --tag "noxitu/compiler"