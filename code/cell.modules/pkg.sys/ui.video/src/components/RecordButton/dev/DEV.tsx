import React from 'react';
import { DevActions, LocalStorage } from 'sys.ui.dev';
import { RecordButton, RecordButtonProps, RecordButtonStates, RecordButtonState } from '..';
import { t, rx } from './common';

type Ctx = {
  bus: t.EventBus<any>;
  toStorage(): CtxStorage;
  redraw(): void;
};

type CtxStorage = {
  state: RecordButtonProps['state'];
  size: RecordButtonProps['size'];
  isEnabled: RecordButtonProps['isEnabled'];
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/RecordButton')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const local = LocalStorage<CtxStorage>(`${e.namespace}/dev`);
    const storage = local.object({ state: 'default', size: 45, isEnabled: true });

    return {
      bus,
      props: { bus },
      toStorage: () => storage,
      redraw: () => e.redraw(),
    };
  })

  .items((e) => {
    e.title('RecordButton');

    e.boolean('isEnabled', (e) => {
      const store = e.ctx.toStorage();
      if (e.changing) store.isEnabled = e.changing.next;
      if (e.changing) e.ctx.redraw();
      e.boolean.current = store.isEnabled;
    });

    e.select((config) =>
      config
        .items([45])
        .initial(config.ctx.toStorage().size)
        .pipe(async (e) => {
          const store = e.ctx.toStorage();
          const current = e.select.current[0]; // NB: always first.
          e.select.label = current ? `size: ${current.value}` : `size: unknown`;
          if (e.changing) store.size = current.value;
          if (e.changing) e.ctx.redraw();
        }),
    );

    e.select((config) =>
      config
        .items(RecordButtonStates)
        .initial(config.ctx.toStorage().state)
        .view('buttons')
        .pipe(async (e) => {
          const store = e.ctx.toStorage();
          const current = e.select.current[0]; // NB: always first.
          e.select.label = current ? `state: ${current.value}` : `state: unknown`;
          if (e.changing) store.state = current.value;
          if (e.changing) e.ctx.redraw();
        }),
    );

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });

    e.render(
      <RecordButton
        {...e.ctx.toStorage()}
        bus={e.ctx.bus}
        onClick={(e) => console.log('onClick', e)}
      />,
    );
  });

export default actions;
