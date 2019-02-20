#!/bin/bash
rm -rf lib
node node_modules/typescript/bin/tsc --project local.tsconfig.json $@
