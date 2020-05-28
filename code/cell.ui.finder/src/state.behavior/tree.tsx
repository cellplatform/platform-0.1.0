import { t } from '../common';
import * as behavior from './tree.behavior';
import * as epic from './tree.epic';
import * as reducer from './tree.reduce';

/**
 * Behavior controller for the <TreeView>.
 */
export function init(args: { ctx: t.IFinderContext; store: t.IFinderStore }) {
  const { ctx, store } = args;

  reducer.init({ store });
  epic.init({ store });
  behavior.init({ ctx, store });
}
