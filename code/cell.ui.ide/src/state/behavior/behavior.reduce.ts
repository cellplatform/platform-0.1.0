import { t } from '../../common';

/**
 * Behavior controller.
 */
export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * REDUCE: Update error.
   */
  store.on<t.IIdeErrorEvent>('APP:IDE/error').subscribe((e) => {
    e.change((state) => {
      const error = e.payload;
      state.error = error;
    });
  });
}
