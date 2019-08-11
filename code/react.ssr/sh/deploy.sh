#!/bin/bash

# echo '\n👆  Increment version'
# npm version patch || { echo '\n😥  Version patch failed'; exit 1; }


echo '\n✊  Build and bundle'
yarn build || { echo '\n😥  Build failed'; exit 1; }


echo '\n👉  Deploy to "now"\n'
now $@ || { echo '\n😥  Deploy failed'; exit 1; }


echo '\n✨✨  Deployment complete.\n'
