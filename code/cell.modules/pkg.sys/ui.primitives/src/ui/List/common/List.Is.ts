import { t } from '../../common';
import { ListState } from '../../List.State';

/**
 * Boolean flags.
 */
export const ListIs = {
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
    state?: () => t.ListState | undefined;
  }): t.ListItemRenderFlags {
    const { index, total, orientation, bullet } = args;
    const getState = () => args.state?.();

    let _previous: t.ListItemRenderFlags | undefined;
    let _next: t.ListItemRenderFlags | undefined;
    const sibling = (index: number) => ListIs.toItemFlags({ ...args, index });

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
      mouse: {
        get over() {
          const state = getState();
          return state ? state?.mouse?.over === index : false;
        },
        get down() {
          const state = getState();
          return state ? state?.mouse?.down === index : false;
        },
      },
      get focused() {
        const state = getState();
        return state?.selection?.isFocused ?? false;
      },
      get selected() {
        const state = getState();
        const selection = state?.selection?.indexes;
        return ListState.Selection.isSelected(selection, index);
      },
      previous() {
        if (is.first) return undefined;
        return _previous || (_previous = sibling(index - 1));
      },
      next() {
        if (is.last) return undefined;
        return _next || (_next = sibling(index + 1));
      },
    };

    return is;
  },
};
