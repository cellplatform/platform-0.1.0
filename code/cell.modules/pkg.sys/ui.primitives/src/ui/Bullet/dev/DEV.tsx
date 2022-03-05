import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Bullet, BulletProps, BulletConstants } from '..';

type Ctx = { props: BulletProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Bullet')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('size')
        .items([
          { label: `<undefined> (default: ${BulletConstants.DEFAULTS.SIZE})`, value: undefined },
          5,
          8,
          12,
          16,
          60,
        ])
        .initial(config.ctx.props.size)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.size = e.changing?.next[0].value;
        });
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
    e.settings({
      host: { background: -0.04 },
      layout: {
        // label: '',
        // position: [150, 80],
        // border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Bullet {...e.ctx.props} />);
  });

export default actions;
