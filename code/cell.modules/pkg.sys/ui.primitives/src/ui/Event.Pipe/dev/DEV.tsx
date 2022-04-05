import React from 'react';
import { Observable, Subject } from 'rxjs';

import { DevActions, ObjectView } from 'sys.ui.dev';
import { EventPipe, EventPipeProps, EventPipeTheme } from '..';
import { useEventHistory } from '../../Event';
import { t, rx, time, COLORS } from '../../common';

type Ctx = {
  bus: t.EventBus<any>;
  props: EventPipeProps;
  debug: {
    count: number;
    reset$: Subject<void>;
  };
};

function fireSample(ctx: Ctx, msg?: string) {
  ctx.debug.count++;
  msg = msg || `hello ${ctx.debug.count}`;
  ctx.bus.fire({ type: 'sample/event', payload: { msg } });
}

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.EventPipe')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();

    const ctx: Ctx = {
      bus,
      props: {
        orientation: 'x',
        theme: 'Dark',
        // theme: 'Light',
      },
      debug: {
        count: 0,
        reset$: new Subject<void>(),
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    time.delay(500, () => fireSample(ctx));
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

  .items((e) => {
    e.title('debug');
    e.button('fire', (e) => fireSample(e.ctx));
    e.button('reset', (e) => e.ctx.debug.reset$.next());

    e.hr(1, 0.1);

    e.select((config) => {
      config
        .view('buttons')
        .title('theme')
        .items(EventPipe.constants.THEMES)
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.hr();
    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={10} />;
    });
  })

  .subject((e) => {
    const { props, bus, debug } = e.ctx;

    const size = 300;
    const theme = props.theme as EventPipeTheme;
    const isLight = theme === 'Light';
    const { orientation } = props;

    e.settings({
      host: {
        background: isLight ? -0.04 : COLORS.DARK,
      },
      layout: {
        cropmarks: isLight ? -0.2 : 0.6,
        labelColor: isLight ? -0.5 : 0.8,
        width: orientation === 'x' ? size : undefined,
        height: orientation === 'y' ? size : undefined,
      },
    });

    e.render(<Sample {...props} bus={bus} reset$={debug.reset$} style={{ flex: 1 }} />);
  });

export default actions;

/**
 * <SAMPLE>
 */
export type SampleProps = EventPipeProps & { bus: t.EventBus<any>; reset$: Observable<void> };
export const Sample: React.FC<SampleProps> = (props) => {
  const { bus, reset$ } = props;
  const history = useEventHistory(bus, { reset$ });
  return (
    <EventPipe
      {...props}
      events={history.events}
      style={{ flex: 1 }}
      onEventClick={(e) => console.log('onEventClick', e)}
    />
  );
};
