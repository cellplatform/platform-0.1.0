import React from 'react';
import { PathListDev, PathListDevProps } from '..';
import { DevActions, ObjectView, TestFilesystem, t } from '../../../test';

type Ctx = {
  fs: t.Fs;
  props: PathListDevProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Fs.PathList.Dev')
  .context((e) => {
    if (e.prev) return e.prev;

    const filesystem = TestFilesystem.init();

    const ctx: Ctx = {
      fs: filesystem.fs,
      props: {
        instance: filesystem.instance(),
        height: 150,
        width: 280,
        labels: true,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('labels', (e) => {
      if (e.changing) e.ctx.props.labels = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.labels);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

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
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<PathListDev {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
