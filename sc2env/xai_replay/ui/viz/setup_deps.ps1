[Environment]::CurrentDirectory = "$PSScriptRoot/js"
$Loc = [Environment]::CurrentDirectory 

Invoke-Expression "$PSScriptRoot\gen_protos.ps1"

if (!(Test-Path $Loc/closure-library)) {
    Write-host "`nCloning google closure library dependency"
    git clone https://github.com/google/closure-library "$Loc/closure-library"
} else {
    Write-host "`nGoogle closure library exists ... skipping"
}

if (!(Test-Path $Loc/protobuf_js)) {
    Write-host "`nCloning and setting up protobuf-js dependency"
    git clone https://github.com/google/protobuf "$Loc/protobuf"
    Move-Item "$Loc/protobuf/js" "$Loc/protobuf_js"

    Write-host "`nCleaning up"
    Remove-Item -R -Force "$Loc/protobuf"
} else {
    Write-host "`nProtobuf-js already exists ... skipping"
}

Write-host "`n... done!"