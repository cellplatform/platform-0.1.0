import * as t from './types';
import { echo } from './app';

type E = { type: 'foo'; payload: { count: number } };
const bus = env.bus as t.EventBus<E>;
const params = (env.in.value || {}) as t.ISampleNodeInValue;
const { tx } = env;

if (typeof params.repeatDone === 'number') {
  let count = 0;
  const done = () => {
    count++;
    bus.fire({ type: 'foo', payload: { count } });
    env.out.done({ count });
  };

  Array.from({ length: params.repeatDone }).forEach(done);
} else {
  let count = 0;
  const done = () => {
    count++;
    bus.fire({ type: 'foo', payload: { count } });
    env.out.done<t.ISampleNodeOutValue>({
      echo: echo(),
      process: process.env,
      env: { tx },
    });
  };

  if (params.setContentType) {
    env.out.contentType(params.setContentType);
  }
  if (params.setContentDef) {
    env.out.contentDef(params.setContentDef);
  }

  if (params.delay) {
    console.log('delay start', params.id, params.delay);
    setTimeout(() => {
      console.log(params.id, 'delay complete');
      done();
    }, params.delay);
  } else {
    done();
  }
}
