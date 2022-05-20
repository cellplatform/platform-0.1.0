import React from 'react';
import { TEST, DevActions, ObjectView } from '../../../test';
import { FsPathList, PathListStatefulProps } from '..';
import { t, rx, cuid, value, IndexedDb, List, COLORS } from '../common';

type Ctx = {
  bus: t.EventBus;
  fs: t.Fs;
  props: PathListStatefulProps;
  debug: {
    render: boolean;
    json?: any;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Fs.PathList.Stateful')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus, id: TEST.FS_DEV };

    IndexedDb.create(instance);
    const fs = IndexedDb.Events(instance).fs();

    const ctx: Ctx = {
      bus,
      fs,
      props: {
        instance,
        scroll: true,
        selection: List.SelectionConfig.default,
        theme: FsPathList.DEFAULT.THEME,
        droppable: true,
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
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .view('buttons')
        .items(FsPathList.THEMES.map((value) => ({ label: `theme: ${value}`, value })))
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.boolean('scroll', (e) => {
      if (e.changing) e.ctx.props.scroll = e.changing.next;
      e.boolean.current = e.ctx.props.scroll;
    });

    e.boolean('droppable', (e) => {
      if (e.changing) e.ctx.props.droppable = e.changing.next;
      e.boolean.current = e.ctx.props.droppable;
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

    e.button('add (generate sample)', async (e) => {
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

    e.hr(1, 0.1);

    e.button('clear: (delete all)', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });
  })

  .items((e) => {
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

    e.hr(1, 0.1);

    e.component((e) => {
      return (
        <ObjectView
          name={'current'}
          data={e.ctx.debug.json}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const debug = e.ctx.debug;
    const instance = e.ctx.props.instance;
    const isLight = e.ctx.props.theme === 'Light';

    e.settings({
      host: { background: isLight ? -0.04 : COLORS.DARK },
      layout: {
        label: {
          topLeft: '<Fs.PathList.Stateful>',
          bottomLeft: `${rx.bus.instance(instance.bus)}`,
          bottomRight: `filesystem: "${instance.id}"`,
        },
        cropmarks: isLight ? -0.2 : 0.2,
        labelColor: isLight ? -0.5 : 0.8,
        border: isLight ? -0.1 : 0.1,
        background: isLight ? 1 : 0.02,
        position: [150, null],
        width: 450,
      },
    });

    const style = { flex: 1 };
    e.render(debug.render && <FsPathList.Stateful {...e.ctx.props} style={style} />);
  });

export default actions;
