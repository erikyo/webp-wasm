#!/bin/bash

set -e

apt-get install git

export WEBP_GIT_URL="https://github.com/webmproject/libwebp.git"
export WEBP_GIT_BRANCH="1.2.2"

export PWD=`pwd`
export WEBP_SRC="${PWD}/libwebp"

rm -rf $WEBP_SRC || true
git clone $WEBP_GIT_URL -b $WEBP_GIT_BRANCH

# COMPILE WASM
echo "======="
echo ""
echo "wasm"
echo ""
echo "======="
(
  time emcc -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    -s 'EXPORT_NAME="WebpWasm"' \
    --bind \
    -I libwebp \
    -s ALLOW_MEMORY_GROWTH=1 \
    webp.c \
    -o webp.js \
    -I libwebp/src/{dec,dsp,demux,enc,mux,utils}/*.c
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
