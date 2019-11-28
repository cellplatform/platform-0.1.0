import { t } from '../common';
import { sys, wildcard } from './route.sys';
import * as ns from './route.ns';
import * as coord from './route.coord';

/**
 * Register routes.
 */
export function init(args: { db: t.IDb; router: t.IRouter; title?: string }) {
  sys.init(args);
  ns.init(args);
  coord.init(args);
  wildcard.init(args);
}
