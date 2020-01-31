#!/bin/bash
cd demo

cd v1.hello-world && npm outdated && yarn && cd ..
cd v1.react && npm outdated && yarn && cd ..
cd v1.react.modules && npm outdated && yarn && cd ..

cd v2.hello-world && npm outdated && yarn && cd ..


