#!/bin/bash

rm -rf .cache

cd demo

cd v1.hello-world && yarn clean && cd ..
cd v1.react && yarn clean && cd ..
cd v1.react.modules && yarn clean && cd ..
cd v1.datagrid && yarn clean && cd ..

cd v2.hello-world && yarn clean && cd ..

