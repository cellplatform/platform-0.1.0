import { t } from '../../common';

/**
 * Behavior controller.
 */
export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * REDUCE: Update overlay
   */
  store.on<t.ISysOverlayEvent>('APP:SYS/overlay').subscribe((e) => {
    e.change((state) => {
      state.overlay = e.payload.overlay;
    });
  });

  /**
   * REDUCE: Update error.
   */
  store.on<t.ISysErrorEvent>('APP:SYS/error').subscribe((e) => {
    e.change((state) => {
      const error = e.payload;
      state.error = error;
    });
  });
}
