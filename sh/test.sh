#!/bin/bash
cwd=$(pwd)

test () {
  cd code/$1 
  yarn
  yarn test
  cd $cwd
}

echo no-op

# test test

# test ts
# test ts.libs

# test cli
# test fs
# test log
# test electron

# test util
# test util.css
# test util.exec
# test util.is
# test util.react
# test util.string
# test util.value

# test ui.object
