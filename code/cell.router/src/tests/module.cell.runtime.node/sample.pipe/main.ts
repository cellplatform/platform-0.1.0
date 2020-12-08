import * as t from './types';

const result = (env.in.value || { count: 0 }) as t.ISamplePipeValue;
result.count++;
env.out.done<t.ISamplePipeValue>(result);
