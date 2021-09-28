// import { VercelBus } from '../node.BusController';

// const controller = VercelBus.Controller({ bus });

// import('../node.BusController').then

(async () => {
  //
  const { bus } = env;
  console.log('node runtime 👋👋👋');
  console.log('env', env);
  // const { VercelBus } = await import('../node.BusController');
  // m.VercelBus
  // const controller = VercelBus.Controller({ bus });
})();

// console.log('run', env);

// const payload = {
//   msg: '👋',
//   hasBus: Boolean(env.bus),
//   info: env.in.info,
// };

// env.out.done(payload);
// env.bus.fire({ type: 'foo', payload });
