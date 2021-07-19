import { t } from '../common';
import * as info from './sys.info';
import * as assets from './sys.assets';

/**
 * System routes.
 */
export function init(args: { name?: string; db: t.IDb; router: t.Router; deployedAt?: number }) {
  info.init(args);
  assets.init(args);
}
