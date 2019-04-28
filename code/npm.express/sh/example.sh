#!/bin/bash
      # --npm-module='@platform/npm.express.example-server' \

yarn start \
      --npm-module='@tdb/slc.graphql' \
      --npm-token=$NPM_TOKEN \
      --dir='./tmp' \
      --port=3000 \
      --prerelease=beta \
      --url-prefix=/ \
      # --update
