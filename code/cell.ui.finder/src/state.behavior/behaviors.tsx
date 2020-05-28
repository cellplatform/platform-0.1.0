import { SIMPLE } from '../_SAMPLE/TREE';
import { t } from '../common';
import * as tree from './behavior.tree';
import * as view from './behavior.view';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx } = args;

  tree.init(args);
  view.init(args);

  /**
   * Initialize
   */
  ctx.dispatch({ type: 'FINDER/tree', payload: { root: SIMPLE } });
}
