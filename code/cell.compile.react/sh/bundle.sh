#!/bin/bash

echo 
cd demo

echo "hello-world (parcel v1)"
cd parcel-v1.hello-world && yarn bundle && cd ..
echo 

echo "react (parcel v1)"
cd parcel-v1.react && yarn bundle && cd ..
echo 

echo "hello-world (parcel v2)"
cd parcel-v2.hello-world && yarn bundle && cd ..
echo 


