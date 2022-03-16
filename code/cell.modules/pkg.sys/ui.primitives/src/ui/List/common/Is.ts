import { t } from '../../common';
import * as k from '../types';
import { ListSelectionFlags } from '../../List.Selection/ListSelection.Flags';

/**
 * Boolean flags.
 */
export const Is = {
  listEvent(e: t.Event) {
    return e.type.startsWith('sys.ui.List/');
  },

  /**
   * Flags passed to an item renderer.
   */
  toItemFlags(args: {
    index: number;
    total: number;
    orientation: k.ListOrientation;
    bullet: { edge: k.ListBulletEdge };
    selection?: t.ListSelection;
    state?: t.ListState;
  }): k.ListBulletRenderFlags {
    const { index, total, orientation, bullet, selection, state } = args;
    const selected = ListSelectionFlags.selected(selection, index);

    return {
      empty: total === 0,
      single: total === 1,
      first: index === 0,
      last: index === total - 1,
      edge: index === 0 || index === total - 1,
      horizontal: orientation === 'x',
      vertical: orientation === 'y',
      spacer: false,
      bullet: { near: bullet.edge === 'near', far: bullet.edge === 'far' },
      focused: state?.isFocused ?? false,
      selected,
      mouse: {
        over: state ? state.mouse.over === index : false,
        down: state ? state.mouse.down === index : false,
      },
    };
  },
};
