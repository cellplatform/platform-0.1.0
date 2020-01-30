#!/bin/bash

rm -rf .parcel-cache

cd demo

cd parcel-v1.hello-world && yarn clean && cd ..
cd parcel-v1.react && yarn clean && cd ..
cd parcel-v1.react.modules && yarn clean && cd ..
cd parcel-v1.datagrid && yarn clean && cd ..

cd parcel-v2.hello-world && yarn clean && cd ..

