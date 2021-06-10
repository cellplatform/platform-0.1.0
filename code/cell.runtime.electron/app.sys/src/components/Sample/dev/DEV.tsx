import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Sample, SampleProps } from '..';

import { IpcBus } from '../../../common';
import { Foo } from '../../../../../app/src/renderer/renderer.Window'; // TEMP 🐷

type Foo = { type: 'foo'; payload: { count: number } };
type Ctx = { props: SampleProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/Sample')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = {
      ipc: IpcBus<Foo>(),
    };
    // const netbus = IpcBus<Foo>();

    console.log('Foo', Foo);
    console.log('-------------------------------------------');
    bus.ipc.$.subscribe((e) => {
      console.log(' >> netbus', e);
    });

    bus.ipc.fire({ type: 'foo', payload: { count: 123 } });

    return { props: { count: 0 } };
  })

  .items((e) => {
    e.title('props');
    e.button('count: increment', (e) => e.ctx.props.count++);
    e.button('count: decrement', (e) => e.ctx.props.count--);
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Sample>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
