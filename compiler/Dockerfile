FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv clang

RUN apt-get install -y cmake

RUN useradd -ms /bin/bash compiler
USER compiler
WORKDIR /home/compiler

RUN python3 -m venv ./venv && \
    ./venv/bin/pip install fastapi "conan<2" uvicorn
    
    # ./venv/bin/conan profile detect

COPY app .

RUN ./venv/bin/pip install rich