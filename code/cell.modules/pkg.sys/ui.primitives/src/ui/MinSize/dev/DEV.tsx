import React from 'react';
import { DevActions, lorem } from 'sys.ui.dev';

import { MinSize, MinSizeProps } from '..';
import { MinSizeProperties } from '../MinSize.Properties';
import { color, t, css } from '../common';

type Ctx = {
  size?: t.DomRect;
  props: MinSizeProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.MinSize')
  .context((e) => {
    if (e.prev) return e.prev;
    return {
      props: {
        minWidth: 500,
        minHeight: 350,
        onResize: ({ size }) => {
          e.change.ctx((ctx) => (ctx.size = size));
        },
      },
    };
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      const { minWidth, minHeight } = e.ctx.props;
      return (
        <MinSizeProperties
          style={{ MarginX: 20, MarginY: 10 }}
          size={e.ctx.size}
          minWidth={minWidth}
          minHeight={minHeight}
        />
      );
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<MinSize>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const styles = {
      base: css({ padding: 20 }),
      warning: {
        base: css({
          flex: 1,
          Flex: 'center-center',
        }),
        inner: css({
          padding: 40,
          border: `dashed 2px ${color.format(-0.2)}`,
          borderRadius: 20,
        }),
      },
    };

    const elWarning = (
      <div {...styles.warning.base}>
        <div {...styles.warning.inner}>Too Small</div>
      </div>
    );

    const el = (
      <MinSize {...e.ctx.props} style={{ flex: 1 }} warningElement={elWarning}>
        <div {...styles.base}>{lorem.words(30)}</div>
      </MinSize>
    );

    e.render(el);
  });

export default actions;
