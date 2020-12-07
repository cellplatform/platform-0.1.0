/* eslint-disable @typescript-eslint/no-unused-vars */

import { routes, t, util } from '../common';
import { exec } from './handler.exec';

/**
 * Routes for executing a function within the environment runtime.
 */
export function init(args: { db: t.IDb; router: t.IRouter; runtime?: t.RuntimeEnv }) {
  const { db, router, runtime } = args;

  /**
   * POST execute function
   */
  router.post(routes.FUNC.RUN, async (req) => {
    try {
      if (!runtime) {
        throw new Error(`Runtime environment for executing functions not available.`);
      }

      const host = req.host;
      const query = req.query as t.IReqQueryFuncRun;
      const body = ((await req.body.json()) || {}) as t.IReqPostFuncRunBody;

      const defaultPull = query.pull;
      const defaultSilent = query.silent;
      const defaultTimeout = query.timeout;

      return exec({ host, db, runtime, body, defaultPull, defaultSilent, defaultTimeout });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}
