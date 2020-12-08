import * as t from './types';

const result = (env.in.value || { count: 0 }) as t.ISamplePipeValue;

if (result.count < 0) {
  throw new Error('Derp');
}

result.count++;
env.out.done<t.ISamplePipeValue>(result);
