#!/bin/bash

# Compile the GO program into a WASM file.
cd src 
GOARCH=wasm GOOS=js go build -o ../dist/lib.wasm main.go

cd ..

# Copy static assets.
mkdir -p dist
cp src/index.html dist/index.html
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" dist/wasm-exec.js
