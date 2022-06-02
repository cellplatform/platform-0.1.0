import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { RouteContainer, RouteContainerProps } from '..';
import { COLORS, t } from '../common';

import { SAMPLE } from '../../DEV.Sample.data';

type Ctx = {
  size?: t.DomRect;
  props: RouteContainerProps;
  debug: {
    selectedPath?: string;
    renderPath: boolean;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.RouteContainer')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        defs: SAMPLE.defs,
        onResize: (e) => change.ctx((ctx) => (ctx.size = e.size)),
      },
      debug: {
        renderPath: false,
        selectedPath: SAMPLE.defs[0].path,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('render: def.path', (e) => {
      if (e.changing) e.ctx.debug.renderPath = e.changing.next;
      e.boolean.current = e.ctx.debug.renderPath;
    });

    e.hr(1, 0.1);

    e.select((config) => {
      config
        .items(SAMPLE.defs.map((def) => ({ label: `path: ${def.path}`, value: def.path })))
        .initial(SAMPLE.defs[0].path)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.selectedPath = e.changing?.next[0].value;
        });
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
          data={e.ctx}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
          expandLevel={3}
        />
      );
    });
  })

  .subject((e) => {
    const { props, debug, size } = e.ctx;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<RouteContainer>',
          topRight: `${size?.width ?? '-'} x ${size?.height ?? '-'} px`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(<RouteContainer {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
