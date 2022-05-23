import React from 'react';

import { FsPathList, PathListStatefulProps } from '..';
import { DevActions, ObjectView, TestFs } from '../../../test';
import { value, Path, List, COLORS, cuid, rx, t } from '../common';

type Ctx = {
  fs: t.Fs;
  props: PathListStatefulProps;
  debug: { render: boolean; dir: string };
  output: { state?: any };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Fs.PathList')
  .context((e) => {
    if (e.prev) return e.prev;

    const change = e.change;
    const { fs, instance } = TestFs.init();

    const ctx: Ctx = {
      fs,
      props: {
        instance,
        scroll: true,
        selectable: List.SelectionConfig.default,
        theme: FsPathList.DEFAULT.THEME,
        droppable: true,
        onStateChange: (e) => change.ctx((ctx) => (ctx.output.state = e.to)),
      },
      debug: { render: true, dir: '' },
      output: {},
    };

    return ctx;
  })

  .items((e) => {
    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.button('redraw', (e) => e.redraw());

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
          config={e.ctx.props.selectable}
          style={{ Margin: [10, 20, 10, 30] }}
          onChange={({ config }) => e.change.ctx((ctx) => (ctx.props.selectable = config))}
        />
      );
    });

    e.hr();
  })

  .items((e) => {
    e.title('Read/Write');

    e.textbox((config) =>
      config
        .placeholder('within directory')
        .initial(config.ctx.debug.dir)
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            const next = e.changing.next || '';
            e.ctx.debug.dir = next;
          }
        }),
    );

    e.button('add (generate sample)', async (e) => {
      const toPath = (ctx: Ctx, count: number) => {
        const dir = Path.trimSlashes(ctx.debug.dir);
        const filename = `file-${count + 1}.json`;
        return dir ? Path.join(dir, filename) : filename;
      };

      const msg = cuid().repeat(value.random(1, 50));
      const fs = e.ctx.fs;
      const total = (await fs.manifest()).files.length;
      const path = toPath(e.ctx, total);
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
          name={'state.current'}
          data={e.ctx.output.state}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.selection']}
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
          bottomLeft: `${rx.bus.instance(instance.bus)}("${instance.id}")`,
          bottomRight: `filesystem:"${instance.fs}"`,
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
