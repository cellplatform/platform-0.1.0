import { t } from '../../common';
import * as reduce from './behavior.reduce';
import * as epic from './behavior.epic';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  reduce.init(args);
  epic.init(args);
}
