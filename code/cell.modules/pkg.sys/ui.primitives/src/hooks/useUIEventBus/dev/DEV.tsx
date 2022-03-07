import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { useUIEventBus, PointerBusArgs } from '..';
import { t, rx, slug } from './DEV.common';
import { DevSample } from './DEV.Sample';

type Ctx = {
  args: PointerBusArgs;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useDomBus')
  .context((e) => {
    if (e.prev) return e.prev;

    const namespace = ' FOO/thing/// '; // NB: "Dirty" namespace is cleaned to "FOO/thing"
    const instance = `demo.${slug()}`;
    const bus = rx.bus();
    const ctx: Ctx = { args: { bus, instance, namespace } };

    return ctx;
  })

  .init(async (e) => {
    const bus = e.ctx.args.bus;
    bus.$.subscribe((e) => console.log('bus.$:', e));
  })

  .items((e) => {
    e.title('Dev');

    e.hr();
    e.component((e) => {
      return (
        <ObjectView
          name={'hook.args'}
          data={e.ctx.args}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { args } = e.ctx;
    const bus = args.bus;

    e.settings({
      host: { background: -0.04 },
    });

    e.render(<DevSample args={args} />, {
      border: -0.1,
      cropmarks: -0.2,
      label: {
        topLeft: 'hook: useDomBus',
        bottomRight: `${rx.bus.instance(bus)}`,
      },
    });
  });

export default actions;
