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
    e.change((state) => {
      const error = e.payload;
      state.error = state.error || {};
      state.error[error.name] = error;
    });
  });
}
