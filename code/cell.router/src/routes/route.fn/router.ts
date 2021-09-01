/* eslint-disable @typescript-eslint/no-unused-vars */

import { routes, t, util } from '../common';
import { exec } from './handler.exec';

/**
 * Routes for executing a function within the environment runtime.
 */
export function init(args: { db: t.IDb; router: t.Router; runtime?: t.RuntimeEnv }) {
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
      const query = req.query as t.IReqQueryFunc;
      const body = ((await req.body.json()) || {}) as t.IReqPostFuncBody;

      const defaultPull = query.pull;
      const defaultSilent = query.silent;
      const defaultTimeout = query.timeout;
      const defaultOnError = query.onError;
      const forceJson = query.json;

      const res = await exec({
        host,
        db,
        runtime,
        body,
        defaultPull,
        defaultSilent,
        defaultTimeout,
        defaultOnError,
        forceJson,
      });

      return res;
    } catch (err: any) {
      return util.toErrorPayload(err);
    }
  });
}
