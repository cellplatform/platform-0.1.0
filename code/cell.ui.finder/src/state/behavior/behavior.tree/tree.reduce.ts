import { t } from '../../../common';

export function init(args: { store: t.IFinderStore }) {
  const { store } = args;

  /**
   * REDUCE: Update tree state.
   */
  store.on<t.IFinderTreeEvent>('FINDER/tree').subscribe((e) => {
    type T = t.IFinderState['tree'];

    const changeOrClear = <K extends keyof T>(from: T[K], to: T[K] | null): T[K] => {
      return to === null ? undefined : to || from;
    };

    e.change((state) => {
      const tree = state.tree;
      const to = e.payload;

      tree.root = changeOrClear<'root'>(tree.root, to.root);
      tree.current = changeOrClear<'current'>(tree.current, to.current);
      tree.selected = changeOrClear<'selected'>(tree.selected, to.selected);
      tree.theme = changeOrClear<'theme'>(tree.theme, to.theme);

      // Clear any "view" error that may have occured on the prior selection.
      delete state.error?.view;
    });
  });
}
