import { filter } from 'rxjs/operators';
import { rx, t } from '../common';

/**
 * Behavior controller for the current [View].
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx } = args;
  const event$ = ctx.event$;

  /**
   * Listen for view requests and render view that maps to the currently selected tree-node.
   */
  rx.eventPayload<t.IFinderViewRequestEvent>(event$, 'FINDER/view/req')
    .pipe(filter((e) => !e.isHandled))
    .subscribe((e) => {
      // NB: Handled in Sample.
    });
}
