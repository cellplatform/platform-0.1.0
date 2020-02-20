#!/bin/bash

yarn clean
parcel build src/html/*.html \
              --experimental-scope-hoisting \
              --no-source-maps
