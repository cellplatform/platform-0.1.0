/* eslint-disable @typescript-eslint/no-unused-vars */

import { routes, t, util } from '../common';
import { execFunc } from './handler.exec';

/**
 * Routes for executing a function within the environment runtime.
 */
export function init(args: { db: t.IDb; router: t.IRouter; runtime?: t.RuntimeEnv }) {
  const { db, router, runtime } = args;

  /**
   * POST execute function
   */
  router.post(routes.FUNC, async (req) => {
    try {
      if (!runtime) {
        throw new Error(`A runtime environment for executing functions not available.`);
      }

      const host = req.host;
      const query = req.query as t.IReqQueryFunc;
      const body = ((await req.body.json()) || {}) as t.IReqPostFuncBody;

      return execFunc({ host, db, runtime, body });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}
