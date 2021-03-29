import { t } from '../../../common';

export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * REDUCE: Update loaded view.
   */
  store.on<t.IFinderViewEvent>('APP:FINDER/view').subscribe((e) => {
    e.change((state) => {
      const { el, isSpinning } = e.payload;
      state.view.el = el === null ? undefined : el;
      state.view.isSpinning = isSpinning === null ? undefined : isSpinning;
    });
  });
}
