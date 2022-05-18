import { t } from '../../common';
import { ListState } from '../../List.State';

/**
 * Boolean flags.
 */
export const Is = {
  listEvent(e: t.Event) {
    return e.type.startsWith('sys.ui.List/');
  },

  /**
   * Flags passed to an item renderer ("is").
   */
  toItemFlags(args: {
    index: number;
    total: number;
    orientation: t.ListOrientation;
    bullet: { edge: t.ListBulletEdge };
    state?: t.ListState;
  }): t.ListItemRenderFlags {
    const { index, total, orientation, bullet, state } = args;

    const selection = state?.selection?.indexes;
    const selected = ListState.Selection.isSelected(selection, index);

    const is = {
      empty: total === 0,
      single: total === 1,
      first: index === 0,
      last: index === total - 1,
      edge: index === 0 || index === total - 1,
      horizontal: orientation === 'x',
      vertical: orientation === 'y',
      spacer: false,
      scrolling: false, // NB: default - Overridden elsewhere {...is, scrolling: <actual> }.
      bullet: { near: bullet.edge === 'near', far: bullet.edge === 'far' },
      focused: state?.selection?.isFocused ?? false,
      selected,
      mouse: {
        over: state ? state.mouse?.over === index : false,
        down: state ? state.mouse?.down === index : false,
      },
      get previous() {
        return is.first ? undefined : Is.toItemFlags({ ...args, index: index - 1 });
      },
      get next() {
        return is.last ? undefined : Is.toItemFlags({ ...args, index: index + 1 });
      },
    };

    return is;
  },
};
