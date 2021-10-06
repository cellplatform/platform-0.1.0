import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { SlugProject, SlugProjectProps } from '..';
import { Filesystem, DEFAULT, t, IpcBus, MinSizeProperties, rx } from '../common';

type E = t.Event;

type Ctx = {
  is: { electron: boolean };
  fs: t.Fs;
  props: SlugProjectProps;
  size?: t.DomRect;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/SlugProject')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus<any>();

    const id = 'main';
    const events = Filesystem.Events({ id, bus: IpcBus<E>() });
    const fs = events.fs('scratchpad.SlugProject');
    const isElectron = IpcBus.is.available;

    const ctx: Ctx = {
      is: { electron: isElectron },
      fs,
      props: {
        bus,
        fs: isElectron ? fs : undefined,
        isEditable: isElectron,
        minWidth: DEFAULT.MIN.WIDTH,
        minHeight: DEFAULT.MIN.HEIGHT,
        onResize: ({ size }) => e.change.ctx((ctx) => (ctx.size = size)),
      },
    };

    return ctx;
  })

  .items((e) => {
    e.title('SlugProject');

    e.boolean('isEditable', (e) => {
      if (e.changing) e.ctx.props.isEditable = e.boolean.current ?? false;
      e.boolean.current = e.ctx.props.isEditable ?? false;
    });

    e.hr(1, 0.1);

    e.button('fs: test save', async (e) => {
      if (!e.ctx.is.electron) {
        console.warn('(filesystem) NOT ELECTRON');
        return;
      }
      const fs = e.ctx.fs;

      // console.log('fs', fs);
      // const info = await fs.info('');
      // console.log('info', info);

      const m = await fs.manifest();
      console.log('m', m);

      const text = new TextEncoder().encode('Hello');
      const res = await fs.write('test.txt', text);

      console.log('res', res);
    });

    e.hr();

    e.component((e) => {
      return (
        <MinSizeProperties
          title={'MinSize'}
          size={e.ctx.size}
          props={e.ctx.props}
          style={{ MarginX: 20, MarginY: 10 }}
        />
      );
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<SlugProject>',
          topRight: `A1 filesystem: ${Boolean(e.ctx.is.electron)}`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<SlugProject {...e.ctx.props} />);
  });

export default actions;
