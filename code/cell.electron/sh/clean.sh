#!/bin/bash

rm -f yarn-error.log
rm -rf lib/
rm -rf out/

cd app.ui
yarn clean

cd ..
cd app
yarn clean
