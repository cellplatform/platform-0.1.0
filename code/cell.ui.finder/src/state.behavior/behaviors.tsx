import { t } from '../common';
import * as tree from './behavior.tree';
import * as view from './behavior.view';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  tree.init(args);
  view.init(args);
}
