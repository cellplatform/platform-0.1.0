import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { css, COLORS, Color } from '../../common';

type Ctx = {
  tmp?: number;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Design')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {};
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Design');

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Design>',
        position: [80, 80],
        cropmarks: -0.2,
        border: -0.06,
        background: 0.3,
      },
    });

    const styles = {
      base: css({
        flex: 1,
        backgroundImage: `url(/static/tmp.images/design.png)`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      }),
    };

    const el = <div {...styles.base}></div>;

    e.render(el);
  });

export default actions;
