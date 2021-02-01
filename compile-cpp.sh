#!/bin/bash

IMAGE=docker.io/emscripten/emsdk:2.0.13
WD=$(pwd)

if which docker &> /dev/null
then
   set -xe
   docker run --rm -v ${WD}:/src -v em-cache:/emsdk/upstream/emscripten/cache -u $(id -u):$(id -g) $IMAGE /bin/bash compile-cpp.sh $@
   exit
elif which podman &> /dev/null
then
   set -xe
   podman run --rm -v $WD:/src:Z -v em-cache:/emsdk/upstream/emscripten/cache $IMAGE /bin/bash compile-cpp.sh $@
   exit
fi

OPTS=""

# Export some functions
OPTS="$OPTS -s "EXPORTED_FUNCTIONS='["_malloc","_free"]'
OPTS="$OPTS -s "EXPORTED_RUNTIME_METHODS='["cwrap"]'

#DEBUG=true # comment out to disable
if [ ! -z "$DEBUG" ]; then
   # Enable few debug options
   OPTS="$OPTS -g -s ASSERTIONS=1"
else
   # Optimize javascript glue size
   OPTS="$OPTS --closure 1"
   OPTS="$OPTS"
fi

# Enable asyncify
OPTS="$OPTS -s ASYNCIFY -s ASYNCIFY_IGNORE_INDIRECT=1 -s "ASYNCIFY_IMPORTS='["algorithm_step","algorithm_done"]'
# Build for web es6
OPTS="$OPTS -s MODULARIZE=1 -s EXPORT_ES6=1 -s ENVIRONMENT=web"
# Disable exceptions and RTTI
#OPTS="$OPTS -fno-rtti -fno-exceptions"
# Enable optimizations (basically required for ASYNCIFY)
OPTS="$OPTS -O3"
# Allow growing memory so that we don't have to allocate everything at the begining
# And since we only build wasm it does not really have a penalty
OPTS="$OPTS -s ALLOW_MEMORY_GROWTH=1"
# link-time optimizations
OPTS="$OPTS -flto"

mkdir -p public/wasm

set -xe
for F in cpp-src/*.cpp
do
   BASE=`basename $F .cpp`
   time emcc $OPTS -o /tmp/$BASE.js cpp-src/$BASE.cpp
   ls -lh /tmp/$BASE.js /tmp/$BASE.wasm
   cp /tmp/$BASE.js /tmp/$BASE.wasm public/wasm/
done
