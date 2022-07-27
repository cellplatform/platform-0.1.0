import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DevSample } from './DEV.Sample';
import { t } from '../../common';

type Ctx = {
  size?: t.DomRect;
  onSize?: (size: t.DomRect) => void;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useResizeObserver')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      onSize(size) {
        change.ctx((ctx) => (ctx.size = size));
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
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
      actions: { width: 300 },
      host: { background: -0.04 },
      layout: {
        label: 'useResizeObserver',
        position: [300, 300, 300, 300],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevSample onSize={e.ctx.onSize} style={{ flex: 1 }} />);
  });

export default actions;
