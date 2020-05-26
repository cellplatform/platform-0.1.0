import { t } from '../common';
import { tree } from './behavior.tree';
import { view } from './behavior.view';

/**
 * TODO 🐷
 * - Move into controller
 */

export function init(ctx: t.IFinderContext) {
  tree(ctx);
  view(ctx);

  // rx.eventPayload<t.IFinderViewRenderEvent>(event$, 'FINDER/view/render').subscribe((e) => {
  //   const { node } = e;
  //   if (node === 'intro.files') {
  //     e.render(<Viewer uri={args.uri} />);
  //   } else {
  //     e.render(<Doc />);
  //   }
  // });
}
