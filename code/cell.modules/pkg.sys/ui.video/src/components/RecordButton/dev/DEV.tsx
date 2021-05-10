import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { RecordButton, RecordButtonProps, RecordButtonStates } from '..';
import { t, rx } from './common';

type Ctx = {
  bus: t.EventBus<any>;
  props: RecordButtonProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/RecordButton')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();

    return { bus, props: { bus, size: 45, state: 'default', isEnabled: true } };
  })

  .items((e) => {
    e.title('RecordButton');

    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.props.isEnabled = e.changing.next;
      e.boolean.current = e.ctx.props.isEnabled;
    });

    e.select((config) =>
      config
        .items([45])
        .initial(config.ctx.props.size)
        .pipe(async (e) => {
          const current = e.select.current[0]; // NB: always first.
          e.select.label = current ? `size: ${current.value}` : `size: unknown`;
          if (e.changing) e.ctx.props.size = current.value;
        }),
    );

    e.select((config) =>
      config
        .items(RecordButtonStates)
        .initial(config.ctx.props.state)
        .view('buttons')
        .pipe(async (e) => {
          const current = e.select.current[0]; // NB: always first.
          e.select.label = current ? `state: ${current.value}` : `state: unknown`;
          if (e.changing) e.ctx.props.state = current.value;
        }),
    );

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<RecordButton {...e.ctx.props} onClick={(e) => console.log('onClick', e)} />);
  });

export default actions;
