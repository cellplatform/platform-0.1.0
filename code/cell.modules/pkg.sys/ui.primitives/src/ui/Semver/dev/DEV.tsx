import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Semver, SemverProps } from '..';

type Ctx = {
  props: SemverProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Semver')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: { version: '1.2.3' },
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
      layout: { cropmarks: -0.2 },
    });
    e.render(<Semver {...e.ctx.props} />);
  });

export default actions;
