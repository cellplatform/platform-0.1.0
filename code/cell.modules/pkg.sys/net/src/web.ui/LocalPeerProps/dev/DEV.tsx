import React from 'react';
import { toObject, DevActions } from 'sys.ui.dev';
import { LocalPeerProps, LocalPeerPropsProps } from '..';
import { t, cuid, rx } from '../../common';

type Ctx = { props?: LocalPeerPropsProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.LocalPeerProps')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      // bus: rx.bus(),
      // self: { id: cuid() },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    // const id = cuid();
    // ctx.props.bus = toObject(bus) as t.EventBus;

    // ctx.props = { bus, self: {} };
  })

  .items((e) => {
    e.title('Dev');

    e.hr();
  })

  .subject((e) => {
    const { props } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<LocalPeerProps>',
        // position: [150, 80],
        // border: -0.1,
        cropmarks: -0.2,
        // background: 1,
      },
    });

    e.render(props && <LocalPeerProps {...props} />);
  });

export default actions;
