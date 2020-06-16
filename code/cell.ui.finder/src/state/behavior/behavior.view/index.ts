import { t } from '../../../common';
import * as epic from './view.epic';
import * as reduce from './view.reduce';

/**
 * Behavior controller for the current [View].
 */
export function init(args: { ctx: t.IFinderContext; store: t.IAppStore }) {
  const { ctx, store } = args;

  reduce.init({ store });
  epic.init({ ctx, store });
}
