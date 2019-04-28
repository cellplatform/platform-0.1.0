#!/bin/bash

yarn start \
      --npm-module='@platform/npm.express.example-server' \
      --npm-token=$NPM_TOKEN \
      --dir='./tmp' \
      --port=3000 \
      --prerelease=beta \
      --url-prefix=/ \
      # --update
