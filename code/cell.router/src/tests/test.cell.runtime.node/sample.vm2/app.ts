import * as t from './types';
export const FOO = 1234;
import { log } from '@platform/log/lib/server';
log.info.green('app.ts', log.yellow(FOO));

const ctx = (global as unknown) as t.Global;
ctx.res({ msg: 'app', env: process.env, foo: ctx.foo });
