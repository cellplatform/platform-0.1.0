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
    name?: string;
    deployedAt?: number;
  }) {
    const { db, fs, body, name, deployedAt } = args;
    const router = Router.create({ body });
    routes.init({ db, fs, name, deployedAt, router });
    return router;
  }
}
