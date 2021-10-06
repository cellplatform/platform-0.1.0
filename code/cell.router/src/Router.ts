import { t, Router as BaseRouter } from './common';
import * as routes from './routes';

type UtcDate = number;

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
    deployedAt?: UtcDate;
  }) {
    const { db, fs, runtime, body, name, deployedAt } = args;
    const router = BaseRouter.create({ body });
    routes.init({ db, fs, name, deployedAt, router, runtime });
    return router;
  },
};
