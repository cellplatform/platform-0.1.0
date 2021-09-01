import { t } from '../common';

const now = new Date();
console.log(`\n👋👋👋👋 Hello World!!!!! \n${now.toString()}\n`);

// import { t } from '../common';

const params = (env.in.value ?? {}) as t.SampleIn;

console.log('env', env);
console.log('params', params);
// env

env.out.done<t.SampleOut>({
  echo: params,
  now: now.getTime(),
});
