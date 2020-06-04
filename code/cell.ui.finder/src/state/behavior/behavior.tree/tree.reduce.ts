import { t } from '../../../common';

export function init(args: { store: t.IFinderStore }) {
  const { store } = args;

  /**
   * REDUCE: Update tree state.
   */
  store.on<t.IFinderTreeEvent>('FINDER/tree').subscribe((e) => {
    const state = e.state;
    const tree = state.tree;

    type T = t.IFinderState['tree'];

    const changeOrRemove = <K extends keyof T>(key: K): t.IFinderState['tree'][K] => {
      const from = tree[key];
      const to = e.payload[key];
      return (to === null ? undefined : to || from) as T[K];
    };

    const next = {
      ...state,
      tree: {
        ...tree,
        root: changeOrRemove('root'),
        current: changeOrRemove('current'),
        selected: changeOrRemove('selected'),
        theme: changeOrRemove('theme'),
      },
      error: { ...(state.error || {}), view: undefined }, // Clear any view error.
    };

    e.change(next);
  });
}
