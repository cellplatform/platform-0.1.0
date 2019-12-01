import { t } from '../common';
import * as helpers from './sys.helpers';
import * as info from './sys.info';

/**
 * System routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter; deployedAt?: number }) {
  info.init(args);
  helpers.init(args);
}
