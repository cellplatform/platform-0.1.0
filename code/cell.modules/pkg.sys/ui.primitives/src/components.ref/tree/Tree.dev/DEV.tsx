import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Tree } from '..';
import { COLORS, Icons, t } from './common';

import { COMPREHENSIVE } from './sample';

type Ctx = { props: t.ITreeviewProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.ref/Tree')
  .context((e) => {
    if (e.prev) return e.prev;

    const root = COMPREHENSIVE;

    const props: t.ITreeviewProps = {
      root,
      theme: 'LIGHT',
    };

    return { props };
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('Theme')
        .initial((config.ctx.props.theme as string) ?? 'LIGHT')
        .view('buttons')
        .items(['LIGHT', 'DARK'])
        .pipe((e) => {
          const value = e.select.current[0]?.value; // NB: always first.
          if (e.changing) e.ctx.props.theme = value;
        });
    });

    e.hr();
  })

  .subject((e) => {
    const theme = e.ctx.props.theme ?? 'LIGHT';
    const isDark = theme === 'DARK';

    e.settings({
      host: {
        background: isDark ? COLORS.DARK : -0.04,
      },
      layout: {
        label: '<TreeView>',
        position: [150, null],
        width: 300,
        border: isDark ? 0.1 : -0.1,
        cropmarks: isDark ? 0.3 : -0.2,
      },
    });

    e.render(<Tree.View {...e.ctx.props} renderIcon={renderIcon} />);
  });

export default actions;

/**
 * [Helpers]
 */

const renderIcon: t.RenderTreeIcon = (e) => {
  if (e.icon === 'Face') {
    return Icons[e.icon];
  } else {
    // NB: This arbitrary IF statement is to allow the
    //     event factory "TREEVIEW/render/icon" to be tested.
    return undefined;
  }
};
