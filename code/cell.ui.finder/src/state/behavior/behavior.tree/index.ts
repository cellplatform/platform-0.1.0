import { t } from '../../../common';
import * as handler from './tree.handler';
import * as epic from './tree.epic';
import * as reduce from './tree.reduce';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx, store } = args;

  reduce.init({ store });
  epic.init({ store });
  handler.init({ ctx, store });
}
