#!/bin/bash
cwd=$(pwd)

test () {
  cd code/$1 
  yarn test
  cd $cwd
}

test fs
test libs
test ts
test test
