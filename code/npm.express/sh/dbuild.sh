#!/bin/bash

yarn prepare
docker build -t teamdb/npm.express .
