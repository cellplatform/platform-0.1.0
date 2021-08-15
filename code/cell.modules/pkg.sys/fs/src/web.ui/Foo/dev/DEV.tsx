import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Foo, FooProps } from '..';
import { t, FsBus, rx } from '../../common';

type Ctx = {
  bus: t.EventBus<t.SysFsEvent>;
  events: t.SysFsEvents;
  props: FooProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Foo')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus<t.SysFsEvent>();
    const events = FsBus.Events({ bus });

    const ctx: Ctx = {
      bus,
      events,
      props: {},
    };
    return ctx;
  })

  .items((e) => {
    e.title('sys.fs');

    e.button('info', async (e) => {
      const res = await e.ctx.events.info.get();

      console.log('res', res);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<FileSystem>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Foo {...e.ctx.props} />);
  });

export default actions;
