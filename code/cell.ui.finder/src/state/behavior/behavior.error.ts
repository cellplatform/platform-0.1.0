import { t } from '../../common';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { store: t.IFinderStore }) {
  const { store } = args;

  /**
   * REDUCE: Update error.
   */
  store.on<t.IFinderErrorEvent>('FINDER/error').subscribe((e) => {
    const state = e.state;
    let error = { ...(state.error || {}) };

    switch (e.payload.name) {
      case 'root':
        error = { ...error, root: e.payload };
        break;

      case 'view':
        error = { ...error, view: e.payload };
        break;

      case 'tree':
        error = { ...error, tree: e.payload };
        break;

      default:
        throw new Error(`Error boundary type '${e.payload.name}' not implemented.`);
    }

    e.change({ ...state, error });
  });
}
