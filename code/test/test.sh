export NODE_ENV=test
export TS_NODE_TRANSPILE_ONLY=true
export TS_NODE_FAST=true

mocha $@ \
  --require ts-node/register \
  --watch-extensions ts,tsx \
  'src/**/*.{test,TEST}.ts{,x}'
