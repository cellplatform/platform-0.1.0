import { t } from '../../common';
import * as reduce from './reduce';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  reduce.init(args);
}
