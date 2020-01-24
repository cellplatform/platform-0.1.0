#!/bin/bash

rm -rf .parcel-cache


cd demo

cd hello-world && yarn clean && cd ..
cd react && yarn clean && cd ..
cd react.application && yarn clean && cd ..

# rm -rf demo/hello-world/dist
# rm -rf demo/hello-world/.parcel-cache

# rm -rf demo/react/dist
# rm -rf demo/react/.parcel-cache


