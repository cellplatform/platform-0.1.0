import { t } from '../../common';

/**
 * State transforms (reducers).
 */
export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * REDUCE: Update error.
   */
  store.on<t.IAppErrorEvent>('APP:ui.smb-bi/error').subscribe((e) => {
    e.change((state) => {
      const error = e.payload;
      state.error = error;
    });
  });
}
