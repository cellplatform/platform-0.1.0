import React from 'react';
import { Observable, Subject } from 'rxjs';

import { DevActions } from 'sys.ui.dev';
import { EventPipe, EventPipeProps } from '.';
import { useEventBusHistory } from '../Event';
import { t, rx, time } from '../../common';

type Ctx = {
  bus: t.EventBus<any>;
  reset$: Subject<void>;
  count: number;
  fireSample(msg?: string): void;
  props: EventPipeProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.event/EventPipe')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const reset$ = new Subject<void>();

    const fireSample = (msg?: string) => {
      ctx.count++;
      msg = msg || `hello ${ctx.count}`;
      bus.fire({ type: 'sample/event', payload: { msg } });
    };

    time.delay(500, () => fireSample());

    const ctx: Ctx = {
      bus,
      reset$,
      count: 0,
      fireSample,
      props: { orientation: 'x' },
    };

    return ctx;
  })

  .items((e) => {
    e.title('debug');
    e.button('reset', (e) => e.ctx.reset$.next());
    e.button('fire', (e) => e.ctx.fireSample());
    e.hr();
  })

  .items((e) => {
    e.title('props');

    e.select((config) => {
      config
        .initial(config.ctx.props.orientation)
        .title('orientation')
        .view('buttons')
        .items(['x', 'y'])
        .pipe((e) => {
          if (e.changing) e.ctx.props.orientation = e.changing.next[0].value;
        });
    });

    e.hr();
  })

  .subject((e) => {
    const { props, bus, reset$ } = e.ctx;

    const size = 300;
    const { orientation } = props;

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        width: orientation === 'x' ? size : undefined,
        height: orientation === 'y' ? size : undefined,
      },
    });
    e.render(<Sample {...props} bus={bus} reset$={reset$} style={{ flex: 1 }} />);
  });

export default actions;

export type SampleProps = EventPipeProps & { bus: t.EventBus<any>; reset$: Observable<void> };
export const Sample: React.FC<SampleProps> = (props) => {
  const { bus, reset$ } = props;
  const history = useEventBusHistory(bus, { reset$ });
  return (
    <EventPipe
      {...props}
      events={history.events}
      style={{ flex: 1 }}
      onEventClick={(e) => console.log('onEventClick', e)}
    />
  );
};
