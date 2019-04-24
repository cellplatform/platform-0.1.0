#!/bin/bash

# yarn prepare
yarn build
docker build -t teamdb/npm.express .
