import { t } from '../../common';
import * as tree from './behavior.tree';
import * as view from './behavior.view';
import * as error from './behavior.error';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IAppStore }) {
  tree.init(args);
  view.init(args);
  error.init(args);
}
