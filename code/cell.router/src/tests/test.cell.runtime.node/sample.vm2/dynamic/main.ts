import * as t from '../types';
import('./app');

const ctx = (global as unknown) as t.Global;
ctx.res({ msg: 'dynamic/main', env: process.env, foo: ctx.foo });
