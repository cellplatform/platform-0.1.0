import * as t from './types';

const result = (env.in.value || { count: 0 }) as t.ISamplePipeInValue;
result.count++;
env.out.done<t.ISamplePipeOutValue>(result);
