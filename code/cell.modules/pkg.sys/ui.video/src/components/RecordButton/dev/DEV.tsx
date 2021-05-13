import { CssProps } from '@platform/css';
import React from 'react';
import { DevActions, LocalStorage } from 'sys.ui.dev';
import {
  RecordButton,
  RecordButtonProps,
  RecordButtonStates,
  RecordButtonDialogHandlerArgs,
} from '..';
import { color, t, rx } from './common';
import { DevDialog } from './DEV.Dialog';

type DialogKind = 'hello' | 'dev/dialog';
const DialogKinds: DialogKind[] = ['hello', 'dev/dialog'];

type Ctx = {
  bus: t.EventBus<any>;
  toStorage(): CtxStorage;
  redraw(): void;
};

type CtxStorage = {
  state: RecordButtonProps['state'];
  size: RecordButtonProps['size'];
  isEnabled: RecordButtonProps['isEnabled'];
  dialog: DialogKind;
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
    const storage = local.object({
      state: 'default',
      size: 45,
      isEnabled: true,
      dialog: 'hello',
    });

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

    e.select((config) =>
      config
        .items(DialogKinds)
        .initial(config.ctx.toStorage().dialog)
        .view('buttons')
        .pipe(async (e) => {
          const store = e.ctx.toStorage();
          const current = e.select.current[0]; // NB: always first.
          e.select.label = current ? `dialog: ${current.value}` : `dialog: unknown`;
          if (e.changing) store.dialog = current.value;
          if (e.changing) e.ctx.redraw();
        }),
    );
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });

    const dialogFactory = (args: RecordButtonDialogHandlerArgs) => {
      const kind = e.ctx.toStorage().dialog;

      if (kind === 'hello') {
        const style: CssProps = {
          flex: 1,
          padding: 15,
          backgroundColor: color.format(-0.03),
        };
        return <div style={style}>Hello! 👋</div>;
      }

      if (kind === 'dev/dialog') {
        return <DevDialog />;
      }

      return undefined;
    };

    e.render(
      <RecordButton
        {...e.ctx.toStorage()}
        bus={e.ctx.bus}
        onClick={(e) => console.log('onClick', e)}
        onDialog={(e) => {
          const view = dialogFactory(e);
          e.element(view);
        }}
      />,
    );
  });

export default actions;
