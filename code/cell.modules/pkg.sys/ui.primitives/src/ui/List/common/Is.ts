import { t } from '../../common';
import * as k from '../types';

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
    isFocused?: boolean;
  }): k.ListBulletRenderFlags {
    const { index, total, orientation, bullet, selection, isFocused = false } = args;
    const selected = selection ? selection.indexes.includes(index) : false;

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
      focused: isFocused,
      selected,
    };
  },
};
