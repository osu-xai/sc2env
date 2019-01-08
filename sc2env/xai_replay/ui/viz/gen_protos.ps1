[Environment]::CurrentDirectory = "$PSScriptRoot/js"

$Loc = [Environment]::CurrentDirectory

Write-host "Building protobuf file"
# WARNING, if your editor is set to autoformat on save, saving this file will BREAK this line by adding a space
# in "vizProto,binary". Make sure you override that setting for this directory
protoc --proto_path="$Loc/../../common_protos" --js_out=library=vizProto,binary:"$Loc" "$Loc/../../common_protos/*.proto"
