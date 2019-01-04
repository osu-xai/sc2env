#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)/js"
cd $DIR

source "../gen_protos.sh"

if [ ! -d "closure-library" ]; then
    printf "\nCloning google closure library dependency\n"
    git clone https://github.com/google/closure-library
else
    printf "\nGoogle closure library exists ... skipping\n"
fi

if [ ! -d "protobuf_js" ]; then
    printf "\nCloning and setting up protobuf-js dependency\n"
    git clone https://github.com/google/protobuf
    mv protobuf/js ./protobuf_js

    printf "\nCleaning Up\n"
    rm -rf protobuf
else
    printf "\nProtobuf-js already exists ... skipping"
fi

printf "\n... done!\n"
