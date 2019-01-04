#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)/js"
cd $DIR

printf "Building protobuf file\n"


PROTO_INCLUDE=`realpath "$DIR/../../common_protos"`
PROTOS="$PROTO_INCLUDE"/*.proto

protoc --proto_path="$PROTO_INCLUDE" --js_out=library=vizProto,binary:"." $PROTOS
