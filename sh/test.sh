#!/bin/bash

function test () {
  cd code/$1
  yarn test
}

test ts
