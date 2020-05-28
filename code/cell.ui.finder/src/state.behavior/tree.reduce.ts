import { t } from '../common';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { store: t.IFinderStore }) {
  const { store } = args;

  /**
   * REDUCE: Update tree state.
   */
  store.on<t.IFinderTreeEvent>('FINDER/tree').subscribe((e) => {
    const state = e.state;
    const tree = state.tree;

    const changeOrRemove = <K extends keyof t.IFinderState['tree']>(
      key: K,
    ): t.IFinderState['tree'][K] => {
      const from = tree[key];
      const to = e.payload[key];
      return (to === null ? undefined : to || from) as t.IFinderState['tree'][K];
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
    };
    e.change(next);
  });
}
