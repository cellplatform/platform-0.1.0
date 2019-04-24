#!/bin/bash

yarn start \
      --npm-module='@tdb/slc.graphql' \
      --port=3000 \
      --prerelease=true \
      --url-prefix=/ \
      --update
