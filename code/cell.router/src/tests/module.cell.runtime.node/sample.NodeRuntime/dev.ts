import * as t from './types';

const { tx } = env;

env.out.done<t.ISampleNodeOutValue>({
  echo: 'hello dev',
  process: process.env,
  env: { tx },
});
