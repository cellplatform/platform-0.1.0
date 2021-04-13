import React from 'react';
import { Observable, Subject } from 'rxjs';
import { DevActions } from 'sys.ui.dev';

import { EventStack, EventStackProps, useEventBusHistory } from '..';
import { rx, t } from '../../../common';

type Ctx = {
  bus: t.EventBus<any>;
  reset$: Subject<void>;
  count: number;
  width?: number;
  props: EventStackProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/EventStack')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus();
    const reset$ = new Subject<void>();

    const ctx: Ctx = {
      bus,
      reset$,
      count: 0,
      width: 300,
      props: {},
    };

    return ctx;
  })

  .items((e) => {
    e.title('debug');

    e.boolean('width', (e) => {
      if (e.changing) e.ctx.width = e.changing.next ? 300 : undefined;
      e.boolean.current = typeof e.ctx.width === 'number';
    });

    e.button('reset', (e) => e.ctx.reset$.next());

    e.hr();
  })

  .items((e) => {
    e.title('events');

    e.button('fire', (e) => {
      e.ctx.count++;
      const msg = `hello ${e.ctx.count}`;
      e.ctx.bus.fire({ type: 'sample/event', payload: { msg } });
    });

    e.hr();
  })

  .subject((e) => {
    const { width, props, bus, reset$ } = e.ctx;
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: { bottomLeft: '<EventStack>' },
        cropmarks: -0.2,
        position: { top: 200 },
        width,
      },
    });
    e.render(<Sample {...props} bus={bus} reset$={reset$} style={{ flex: 1 }} />);
  });

export default actions;

export type SampleProps = EventStackProps & { bus: t.EventBus<any>; reset$: Observable<void> };
export const Sample: React.FC<SampleProps> = (props) => {
  const { bus, reset$ } = props;
  const history = useEventBusHistory({ bus, reset$ });
  return <EventStack {...props} events={history.events} style={{ flex: 1 }} />;
};
