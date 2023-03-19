# Installation

# Patches

EmScripten is based on older CMake. One of functions missing in their patched modules is function `_cmake_record_install_prefix` in file `/usr/share/emscripten/cmake/Modules/CMakeSystemSpecificInformation.cmake`.

EmScripten toolchain hardcodes target extension to `.js`. We can change it in LLVM main `CMakeLists.txt`, by adding somewhere after `project()` call:

    set(CMAKE_EXECUTABLE_SUFFIX ".mjs")

# Building

    cmake -G Ninja ../llvm -DLLVM_ENABLE_PROJECTS=clang -DLLVM_INCLUDE_TESTS=OFF -DCMAKE_BUILD_TYPE=Release -DCMAKE_TOOLCHAIN_FILE=/usr/share/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CXX_FLAGS="-sEXIT_RUNTIME=1"

# Copying 

For moving binary files as text files, following `base64` commands can be used:

    base64 clang-format.wasm > text-file
    base64 -d text-file > clang-format.wasm

Note that `base64 -d` requires "LF" rather than "CRLF" line endings.

# Output Patches

We need access to `FS`, which is not available due to lazy loading introduced by `.mjs`. We need to expose it by adding:

    Module["FS"]=FS;

A good place to do so is around line exposing `run`:

    Module["run"]=run;