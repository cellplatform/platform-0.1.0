import { t } from '../../common';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * REDUCE: Update error.
   */
  store.on<t.IFinderErrorEvent>('APP:FINDER/error').subscribe((e) => {
    e.change((state) => {
      const error = e.payload;
      state.error = state.error || {};
      state.error[error.name] = error;
    });
  });
}
