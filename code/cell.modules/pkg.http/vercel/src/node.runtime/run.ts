console.log('run', env);

const payload = {
  msg: '👋',
  hasBus: Boolean(env.bus),
  info: env.in.info,
};

env.out.done(payload);
env.bus.fire({ type: 'foo', payload });
