import { SIMPLE } from '../_tmp';
import { t } from '../common';
import { tree } from './behavior.tree';
import { view } from './behavior.view';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx } = args;

  tree(args);
  view(args);

  /**
   * Initialize
   */
  ctx.dispatch({ type: 'FINDER/tree', payload: { root: SIMPLE } });
}
