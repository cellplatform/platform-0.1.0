import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { BulletConnectorLinesProps, BulletList } from '../..';
import { Is } from '../../common';

type Ctx = {
  props: BulletConnectorLinesProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.BulletList.ConnectorLines')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        kind: 'Default',
        index: 0,
        total: 3,
        data: null,
        orientation: 'y',
        bullet: { edge: 'near', size: 10 },
        spacing: {},
        radius: 120,
        get is() {
          const props = e.current?.props;
          if (!props) throw new Error('Props');
          return Is.toItemFlags(props);
        },
      },
    };
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
      layout: {
        label: '<ConnectorLines>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        // background: 1,
      },
    });

    const el = <BulletList.Renderers.Bullet.ConnectorLines {...e.ctx.props} />;

    e.render(el);
  });

export default actions;
