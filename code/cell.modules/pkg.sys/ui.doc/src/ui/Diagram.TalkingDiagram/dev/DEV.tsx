import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { TalkingDiagram, TalkingDiagramProps } from '..';

import { TestFilesystem } from '../../../test';
import { t, Filesystem } from '../common';

type Ctx = {
  size?: t.DiagramLayoutSize;
  filesystem: t.TestFilesystem;
  props: TalkingDiagramProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Diagram.TalkingDiagram')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;
    const filesystem = TestFilesystem.init();

    const ctx: Ctx = {
      filesystem,
      props: {
        onResize: (e) => change.ctx((ctx) => (ctx.size = e.size)),
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    await ctx.filesystem.ready();
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      return (
        <Filesystem.PathList.Dev
          instance={e.ctx.filesystem.instance}
          margin={[20, 10, 20, 10]}
          height={100}
        />
      );
    });

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
    const size = e.ctx.size?.root;
    const width = size?.width ?? '-';
    const height = size?.height ?? '-';

    e.settings({
      actions: { width: 350 },
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<TalkingDiagram>',
          topRight: `${width}px x ${height}px`,
        },
        position: [80, 80, 110, 80],
        border: -0.1,
        cropmarks: -0.2,
      },
    });
    e.render(<TalkingDiagram {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
