import { filter } from 'rxjs/operators';
import { rx, t } from '../common';
import { renderDocViewer } from './render.doc';

export function render(args: { ctx: t.IAppContext }) {
  const { ctx } = args;
  const event$ = ctx.event$;

  /**
   * Listen for view requests and render view that maps to the currently selected tree-node.
   */
  rx.payload<t.IFinderViewRequestEvent>(event$, 'APP:FINDER/view/req')
    .pipe(filter((e) => !e.isHandled))
    .subscribe((e) => {
      const root = e.state.tree.root;
      if (root) {
        const nodeId = e.state.tree.selected || '';
        e.render(() => renderDocViewer({ ctx, root, nodeId }));
      }
    });
}
