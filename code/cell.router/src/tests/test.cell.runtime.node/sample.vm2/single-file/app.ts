import * as t from '../types';
import { log } from '@platform/log/lib/server';

export const FOO = 1234;

log.info.green('app.ts', log.yellow(FOO));

const ctx = (global as unknown) as t.Global;
ctx.res({
  msg: 'single-file/app',
  env: process.env,
  foo: ctx.foo,
});
