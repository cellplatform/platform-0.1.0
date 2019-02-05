#!/bin/bash

# Format code.
node ./node_modules/prettier/bin-prettier all --write 'src/**/*.ts{,x}'

# Lint.
node ./node_modules/tslint/bin/tslint 'src/**/*.ts{,x}' --format verbose --fix $@
