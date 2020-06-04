import { t } from '../../../common';

export function init(args: { store: t.IFinderStore }) {
  const { store } = args;

  /**
   * REDUCE: Update tree state.
   */
  store.on<t.IFinderViewEvent>('FINDER/view').subscribe((e) => {
    const state = e.state;
    const view = state.view;

    type V = t.IFinderState['view'];

    const changeOrRemove = <K extends keyof V>(key: K): V[K] => {
      const to = e.payload[key];
      return (to === null ? undefined : to) as V[K];
    };

    const next = {
      ...state,
      view: {
        ...view,
        el: changeOrRemove('el'),
        isSpinning: changeOrRemove('isSpinning'),
      },
    };

    e.change(next);
  });
}
