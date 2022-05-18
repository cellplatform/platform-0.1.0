import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { BulletConnectorLinesProps, List } from '../..';
import { Is, t } from '../../common';

type Ctx = {
  props: BulletConnectorLinesProps;
};

const DEFAULT = {
  BULLET: { edge: 'near', size: 60 } as t.ListItemRendererArgs['bullet'],
};

const Util = {
  update(ctx: Ctx) {
    ctx.props.is = Is.toItemFlags(ctx.props);
    return ctx;
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.List.ConnectorLines')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        kind: 'Default',
        index: 0,
        total: 3,
        data: null,
        orientation: 'y',
        bullet: DEFAULT.BULLET,
        spacing: {},
        radius: 20,
        is: {} as any, // HACK 🐷
      },
    };

    ctx.props.is = Is.toItemFlags(ctx.props);
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    Util.update(e.ctx);
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('orientation')
        .items([
          { label: 'x (horizontal)', value: 'x' },
          { label: 'y (vertical)', value: 'y' },
        ])
        .initial(config.ctx.props.orientation)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) {
            e.ctx.props.orientation = e.changing?.next[0].value;
            Util.update(e.ctx);
          }
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet.edge')
        .initial(config.ctx.props.bullet?.edge)
        .items(['near', 'far'])
        .pipe((e) => {
          if (e.changing) {
            const bullet = e.ctx.props.bullet || (e.ctx.props.bullet = DEFAULT.BULLET);
            bullet.edge = e.changing?.next[0].value;
            Util.update(e.ctx);
          }
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet.size')
        .items([15, 30, 60, 120])
        .initial(config.ctx.props.bullet?.size)
        .pipe((e) => {
          if (e.changing) {
            const bullet = e.ctx.props.bullet || (e.ctx.props.bullet = DEFAULT.BULLET);
            bullet.size = e.changing?.next[0].value;
            Util.update(e.ctx);
          }
        });
    });

    e.select((config) => {
      config
        .title('index')
        .items([0, 1, 2])
        .initial(config.ctx.props.index)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.index = e.changing?.next[0].value;
          Util.update(e.ctx);
        });
    });

    e.select((config) => {
      config
        .title('radius')
        .items([0, 20, 30])
        .initial(config.ctx.props.radius)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.radius = e.changing?.next[0].value;
          Util.update(e.ctx);
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
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const orientation = e.ctx.props.orientation;
    const size = e.ctx.props.bullet.size;
    const isHorizontal = orientation === 'x';
    const isVertical = orientation === 'y';

    e.settings({
      host: { background: -0.04 },
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        width: isHorizontal ? size : 100,
        height: isVertical ? size : 100,
      },
    });

    const el = <List.Renderers.Bullet.ConnectorLines {...e.ctx.props} />;

    e.render(el);
  });

export default actions;
