#!/bin/bash
cd demo
echo 

cd vanilla
echo Demo: Vanilla
parcel build src/index.html
echo 

cd ..

cd react
echo Demo: React
parcel build src/index.html
echo 
