/* eslint-disable @typescript-eslint/no-unused-vars */

import { routes, t, util } from '../common';
import { execFunc } from './handler.exec';

/**
 * Routes for executing a function within the environment runtime.
 */
export function init(args: { db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * POST execute function
   */
  router.post(routes.FUNC, async (req) => {
    try {
      const host = req.host;
      const query = req.query as t.IReqQueryFunc;
      const body = ((await req.body.json()) || {}) as t.IReqPostFuncBody;
      return execFunc({ db, body, host });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}
