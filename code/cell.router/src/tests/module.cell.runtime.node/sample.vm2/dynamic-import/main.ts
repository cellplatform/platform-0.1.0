import * as t from '../types';
import('./app');

console.log('dynamic/main.ts');
console.log('dynamic/main/process.env', process.env);

const ctx = global as unknown as t.Global;
ctx.res({
  msg: 'dynamic-import/main',
  env: process.env,
  foo: ctx.foo,
});
