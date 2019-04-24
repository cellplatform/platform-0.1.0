#!/bin/bash

yarn start \
      --npm-module='@platform/npm.express.example-server' \
      --port=3000 \
      --prerelease=true \
      --url-prefix=/ \
      --update
