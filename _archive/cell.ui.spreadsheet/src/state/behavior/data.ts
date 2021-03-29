import { t } from '../../common';
import * as reduce from './data.reduce';
import * as epic from './data.epic';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  reduce.init(args);
  epic.init(args);
}
