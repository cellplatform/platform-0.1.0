import { t } from '../../common';
import * as error from './error';
import * as data from './data';

/**
 * Initialize behavior controllers.
 */
export function init(args: { ctx: t.IAppContext; store: t.IAppStore }) {
  error.init(args);
  data.init(args);
}
