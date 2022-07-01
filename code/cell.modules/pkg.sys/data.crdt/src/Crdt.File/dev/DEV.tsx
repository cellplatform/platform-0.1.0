import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { CrdtFile } from '..';

type Ctx = {
  tmp?: number;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Crdt.File')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {};
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'ctx'}
          data={e.ctx}
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
      layout: {
        label: '<CrdtFile>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    // e.render(<CrdtFile {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
