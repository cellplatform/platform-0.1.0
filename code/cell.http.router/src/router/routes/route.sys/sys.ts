import { t } from '../common';
import * as info from './sys.info';
import * as assets from './sys.assets';

/**
 * System routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter; deployedAt?: number }) {
  info.init(args);
  assets.init(args);
}
