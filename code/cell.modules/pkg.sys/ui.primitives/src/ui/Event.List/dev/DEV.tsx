import React from 'react';
import { Subject } from 'rxjs';
import { NetworkBusMock } from 'sys.runtime.web';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { EventList, EventListProps } from '..';
import { rx, t } from '../common';
import * as k from '../types';
import { DevSample } from './DEV.Sample';

type Ctx = {
  props: EventListProps;
  netbus: t.NetworkBusMock;
  events: k.EventListEvents;
  count: number;
  reset$: Subject<void>;
};

const fire = (ctx: Ctx, total: number) => {
  new Array(total).fill(true).forEach(() => {
    ctx.count++;
    const count = ctx.count;
    ctx.netbus.fire({
      type: `FOO/sample/${count}`,
      payload: { count },
    });
  });
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.EventList')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = 'sample.foo';
    const events = EventList.Events({ bus, instance });

    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });
    const ctx: Ctx = {
      netbus,
      props: { event: { bus, instance } },
      events,
      count: 0,
      reset$: new Subject<void>(),
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    fire(ctx, 1);

    ctx.events.$.subscribe((e) => {
      console.log('e', e);
    });
  })

  .items((e) => {
    e.title('Debug');

    e.button('fire', (e) => fire(e.ctx, 1));
    e.button('fire (10)', (e) => fire(e.ctx, 10));
    e.button('fire (100)', (e) => fire(e.ctx, 100));

    e.hr(1, 0.1);
    e.button('clear', (e) => e.ctx.reset$.next());

    e.hr();

    e.button('scroll: Top', (e) => e.ctx.events.scroll.fire('Top'));
    e.button('scroll: Bottom', (e) => e.ctx.events.scroll.fire('Bottom'));

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<EventList>',
        position: [150, null],
        width: 400,
        cropmarks: -0.2,
      },
    });
    e.render(<DevSample netbus={e.ctx.netbus} childProps={e.ctx.props} reset$={e.ctx.reset$} />);
  });

export default actions;
