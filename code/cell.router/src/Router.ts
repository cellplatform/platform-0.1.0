import { t, Router as BaseRouter } from './common';
import * as routes from './routes';

export const Router = {
  /**
   * Initialize a new router.
   */
  create(args: {
    db: t.IDb;
    fs: t.FsDriver;
    runtime?: t.RuntimeEnv;
    body: t.BodyParser;
    name?: string;
    deployedAt?: number;
  }) {
    const { db, fs, runtime, body, name, deployedAt } = args;
    const router = BaseRouter.create({ body });
    routes.init({ db, fs, name, deployedAt, router, runtime });
    return router;
  },
};
