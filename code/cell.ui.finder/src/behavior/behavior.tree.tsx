import { TreeView } from '@platform/ui.tree';
import { Observable } from 'rxjs';

import { t } from '../common';

export function tree(ctx: t.IFinderContext) {
  const tree = TreeView.events(ctx.env.event$ as Observable<t.TreeViewEvent>);

  const left = tree.mouse({ button: 'LEFT' });
  left.click.node$.subscribe((e) => {
    // left.click.
    // this.dispatchRenderView({ node: e.id });
    console.log('tree: e.id', e.id);
    // renderView(e.id);
  });

  // const renderView = (node?: string) => {
  //   const payload: t.IFinderViewRender = {
  //     node,
  //     render: (view: React.ReactNode) => this.state$.next({ view }),
  //   };
  //   ctx.dispatch({ type: 'FINDER/view/render', payload });
  // };
}
