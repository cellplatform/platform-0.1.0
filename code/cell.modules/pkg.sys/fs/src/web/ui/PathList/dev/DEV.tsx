import React from 'react';
import { TEST, DevActions } from '../../../test';
import { PathListStateful, PathListStatefulProps } from '..';
import { t, rx, cuid, value, Filesystem, List } from '../common';

type Ctx = {
  bus: t.EventBus;
  fs: t.Fs;
  props: PathListStatefulProps;
  debug: { render: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.PathList.Stateful')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus, id: TEST.FS_DEV };

    Filesystem.create(instance);
    const fs = Filesystem.Events(instance).fs();

    const ctx: Ctx = {
      bus,
      fs,
      props: {
        instance,
        scroll: true,
        selection: List.SelectionConfig.default,
      },
      debug: { render: true },
    };

    return ctx;
  })

  .items((e) => {
    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.hr();

    e.title('Props');

    e.boolean('scroll', (e) => {
      if (e.changing) e.ctx.props.scroll = e.changing.next;
      e.boolean.current = e.ctx.props.scroll;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Behavior');

    e.component((e) => {
      return (
        <List.SelectionConfig
          config={e.ctx.props.selection}
          style={{ Margin: [10, 20, 10, 30] }}
          onChange={({ config }) => e.change.ctx((ctx) => (ctx.props.selection = config))}
        />
      );
    });

    e.hr();
  })

  .items((e) => {
    e.title('Read/Write');

    const toPath = (count: number) => `foo/my-file-${count + 1}.json`;

    e.button('add', async (e) => {
      const msg = cuid().repeat(value.random(1, 50));
      const fs = e.ctx.fs;
      const total = (await fs.manifest()).files.length;
      const path = toPath(total);
      const data = { msg, total };
      fs.json.write(path, data);
    });

    e.hr(1, 0.1);

    e.button('delete: first', async (e) => {
      const fs = e.ctx.fs;
      const first = (await fs.manifest()).files[0];
      if (first) await fs.delete(first.path);
    });

    e.button('delete: last', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      const last = files[files.length - 1];
      if (last) await fs.delete(last.path);
    });

    e.button('delete: all (reset)', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });

    e.hr();
  })

  .subject((e) => {
    const debug = e.ctx.debug;
    const instance = e.ctx.props.instance;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<PathList.Stateful>',
          bottomLeft: `${rx.bus.instance(instance.bus)}`,
          bottomRight: `filesystem: "${instance.id}"`,
        },
        position: [150, null],
        width: 450,
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const style = { flex: 1 };
    e.render(debug.render && <PathListStateful {...e.ctx.props} style={style} />);
  });

export default actions;
