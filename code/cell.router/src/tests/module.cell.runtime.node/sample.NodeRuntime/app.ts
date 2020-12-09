import * as t from './types';
const params = (env.in.value || {}) as t.ISampleNodeInValue;

import { log } from '@platform/log/lib/server';
log.info.green('app.ts', log.yellow(1234));

export function echo() {
  if (params.throwError) {
    throw new Error(params.throwError);
  }
  return params.value;
}
