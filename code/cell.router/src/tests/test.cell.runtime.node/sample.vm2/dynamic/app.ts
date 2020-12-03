import * as t from '../types';
import { log } from '@platform/log/lib/server';

export const FOO = 123456;

log.info.green('dynamic/app.ts', log.yellow(FOO));

const ctx = (global as unknown) as t.Global;
ctx.res({ msg: 'dynamic/app', env: process.env, foo: ctx.foo });
