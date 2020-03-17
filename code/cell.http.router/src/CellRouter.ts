import { t, Router } from './common';
import * as routes from './routes';

export class CellRouter {
  /**
   * Initialize router.
   */
  public static create(args: {
    db: t.IDb;
    fs: t.IFileSystem;
    body: t.BodyParser;
    title?: string;
    deployedAt?: number;
  }) {
    const { db, fs, body, title, deployedAt } = args;
    const router = Router.create({ body });
    routes.init({ db, fs, title, deployedAt, router });
    return router;
  }
}
