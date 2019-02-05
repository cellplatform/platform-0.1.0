#!/bin/bash
cwd=$(pwd)

test () {
  cd code/$1 
  yarn test
  cd $cwd
}

test ts
