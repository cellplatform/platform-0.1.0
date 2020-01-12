import { t } from './common';
import { init as initData } from './router.data';
import { init as initUi } from './router.ui';

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
  initData(args);
  initUi(args);
}
