import { t } from '../common';
import * as tree from './tree';
import * as view from './view';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  tree.init(args);
  view.init(args);
}
