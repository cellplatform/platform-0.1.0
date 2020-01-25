#!/bin/bash
cd demo

cd parcel-v1.hello-world && npm outdated && yarn && cd ..
cd parcel-v1.react && npm outdated && yarn && cd ..
cd parcel-v1.react.application && npm outdated && yarn && cd ..

cd parcel-v2.hello-world && npm outdated && yarn && cd ..


