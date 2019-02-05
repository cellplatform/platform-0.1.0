#!/bin/bash

function test() {
  cd $1
  yarn test
}

test code/ts
