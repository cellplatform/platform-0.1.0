#!/bin/bash
parcel --version

echo 
cd demo

cd hello-world
echo Demo: Hello World
parcel build src/index.html
echo 


cd ..


# cd react
# echo Demo: React
# parcel build src/index.html
# echo 
