import * as t from '../types';

export const FOO = 12345;

console.log('dynamic/app.ts', FOO);
console.log('dynamic/app/process.env', process.env);

const ctx = (global as unknown) as t.Global;
ctx.res({
  msg: 'dynamic-import/app',
  env: process.env,
  foo: ctx.foo,
});

export const hello = (text?: string) => {
  const msg = `hello ${text || ''}`.trim();
  console.log(msg);
  ctx.res({
    msg,
    env: process.env,
    foo: ctx.foo,
  });
};
