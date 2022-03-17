import React from 'react';
import { Observable, Subject } from 'rxjs';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { EventStack, EventStackProps } from '..';
import { rx, t, time } from '../../common';
import { useEventBusHistory } from '../../Event';

type Ctx = {
  bus: t.EventBus<any>;
  reset$: Subject<void>;
  count: number;
  width?: number;
  fireSample(msg?: string): void;
  props: EventStackProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.event.EventStack')
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
      width: 300,
      fireSample,
      props: {},
    };

    return ctx;
  })

  .items((e) => {
    e.title('props');

    e.select((config) => {
      config
        .initial(config.ctx.props.card?.maxDepth || 3)
        .title('card.maxDepth')
        .view('buttons')
        .items([0, 2, 3, 5, 10])
        .pipe((e) => {
          if (e.changing) {
            const props = e.ctx.props;
            (props.card || (props.card = {})).maxDepth = e.changing.next[0].value;
          }
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('debug');

    e.boolean('width', (e) => {
      if (e.changing) e.ctx.width = e.changing.next ? 300 : undefined;
      e.boolean.current = typeof e.ctx.width === 'number';
    });

    e.hr(1, 0.2);
    e.button('fire', (e) => e.ctx.fireSample());
    e.button('reset', (e) => e.ctx.reset$.next());

    e.hr();
    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={10} />;
    });
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
  const history = useEventBusHistory(bus, { reset$ });
  return <EventStack {...props} events={history.events} style={{ flex: 1 }} />;
};
