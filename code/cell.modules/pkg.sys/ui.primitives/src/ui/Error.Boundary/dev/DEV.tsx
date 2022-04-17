import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { ErrorBoundary, ErrorBoundaryProps } from '..';
import { DevSample } from './DEV.Sample';

type Ctx = {
  props: ErrorBoundaryProps;
  debug: {
    noChildren: boolean;
    throw: boolean;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Error.Boundary')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {},
      debug: {
        noChildren: false,
        throw: false,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('throw error (on load)', (e) => {
      if (e.changing) e.ctx.debug.throw = e.changing.next;
      e.boolean.current = e.ctx.debug.throw;
    });

    e.boolean('no children', (e) => {
      if (e.changing) e.ctx.debug.noChildren = e.changing.next;
      e.boolean.current = e.ctx.debug.noChildren;
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
    const { props, debug } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<ErrorBoundary>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const elChildren = debug.noChildren ? undefined : <DevSample throw={debug.throw} />;
    const elError = <ErrorBoundary {...props}>{elChildren}</ErrorBoundary>;

    e.render(elError);
  });

export default actions;
