import { t, rx, onStateChanged, toErrorPayload } from '../../../common';
import { filter, distinctUntilChanged } from 'rxjs/operators';

export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  const { ctx, store } = args;
  const changes = onStateChanged(ctx.event$);
  const event$ = ctx.event$;

  /**
   * Listen for view requests and render view that maps to the currently selected tree-node.
   */
  rx.payload<t.IFinderViewRequestEvent>(event$, 'APP:FINDER/view/req')
    .pipe(filter((e) => !e.isHandled))
    .subscribe((e) => {
      // NB: Handled in plugins.
    });

  type P = t.IFinderViewRequest;

  const fireViewError = (error: Error | string) => {
    fireView({ el: null, isSpinning: false });
    store.dispatch({
      type: 'APP:FINDER/error',
      payload: toErrorPayload({ name: 'view', error }),
    });
  };

  const fireView = (payload: t.IFinderView) => store.dispatch({ type: 'APP:FINDER/view', payload });

  /**
   * Request new view when tree changed.
   */
  changes
    .on('APP:FINDER/tree')
    .pipe(distinctUntilChanged((prev, next) => prev.to.tree.selected === next.to.tree.selected))
    .subscribe((e) => {
      const render: P['render'] = (el) => {
        payload.isHandled = true;
        try {
          if (typeof el === 'function') {
            fireView({ isSpinning: true });
            const promise = el() as Promise<React.ReactNode>;
            promise
              .then((el) => fireView({ el, isSpinning: false }))
              .catch((err) => fireViewError(err));
          } else {
            fireView({ el, isSpinning: false });
          }
        } catch (err) {
          fireViewError(err);
        }
      };

      const payload: P = { state: store.state, isHandled: false, render };
      ctx.fire({ type: 'APP:FINDER/view/req', payload });
    });
}
