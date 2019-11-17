import { t } from '../common';
import * as sys from './route.sys';
import * as wildcard from './route.sys.404';
import * as ns from './route.ns';

/**
 * Register routes.
 */
export function init(args: { db: t.IDb; router: t.IRouter; title?: string }) {
  sys.init(args);
  ns.init(args);
  wildcard.init(args);
}
