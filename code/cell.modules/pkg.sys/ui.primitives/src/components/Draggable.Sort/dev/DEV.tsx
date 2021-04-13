import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Sample } from './Sample';
import { css } from '../../../common';

type Ctx = { count?: number };

/**
 * Actions
 *
 * REF:
 *    https://docs.dndkit.com/
 *
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.drag/Sort')
  .context((prev) => {
    if (prev) return prev;
    return {};
  })

  .items((e) => {
    //
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<DraggableSort>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        display: 'block',
        Scroll: true,
      }),
    };

    const el = (
      <div {...styles.base}>
        <Sample />
      </div>
    );

    e.render(el);
  });

export default actions;
