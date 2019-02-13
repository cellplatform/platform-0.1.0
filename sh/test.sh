#!/bin/bash
cwd=$(pwd)

test () {
  cd code/$1 
  yarn test
  cd $cwd
}

test ts
test ts.cli
test fs
test test
test log
test electron
test util
test util.react
