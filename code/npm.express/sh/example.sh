#!/bin/bash

yarn start \
      --NPM_MODULE=@tdb/slc.graphql \   # (required) name of module being managed.
      --PORT=3000 \                     # (optional) number.
      --PRERELEASE=true \               # (optional) boolean|alpha|beta.
      --URL_PREFIX=/                    # (optional) prepend URL's with path.
