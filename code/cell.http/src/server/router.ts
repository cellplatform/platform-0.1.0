import { t } from './common';
import * as routes from './routes';

/**
 * Register routes.
 */
export function init(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  router: t.IRouter;
  title?: string;
  deployedAt?: number;
}) {
  routes.init(args);
}
