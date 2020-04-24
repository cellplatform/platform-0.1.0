import { ERROR, routes, t, util } from '../common';
import { getNs } from './handler.get';
import { postNs } from './handler.post';
import { getTypes } from './handler.typesystem';

/**
 * Namespace routes.
 */
export function init(args: { db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  const getParams = (req: t.IRouteRequest) => {
    const params = req.params as t.IUrlParamsNs;
    const id = (params.ns || '').toString();

    if (!id) {
      const error: t.IError = {
        type: ERROR.HTTP.MALFORMED_URI,
        message: `Malformed "ns:" URI, does not contain an ID ("${req.url}").`,
      };
      return { status: 400, error };
    }

    return { status: 200, id };
  };

  /**
   * GET: /ns:<id>:A1
   *      Redirect to the cell.
   */
  router.get(routes.NS.CELL, async req => {
    try {
      const params = req.params as t.IUrlParamsCell;
      const path = `/cell:${params.ns}:${params.key}${req.query.toString()}`;
      return req.redirect(path);
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET namespace (root).
   *     Data can be retrieved selectively using query-string.
   *     eg:
   *        - /ns:foo
   *        - /ns:foo?cells
   *        - /ns:foo?cells=A1:A5
   *        - /ns:foo?cells=A1:A5,C3
   *        - /ns:foo?cells&rows&columns   [NB: Same format for rows/columns query flags].
   */
  router.get(routes.NS.INFO, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryNsInfo;
    const { status, id, error } = getParams(req);
    return !id || error ? { status, data: { error } } : getNs({ host, db, id, query });
  });

  /**
   * POST namespace data (save to database).
   */
  router.post(routes.NS.INFO, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryNsWrite;
    const { status, id, error } = getParams(req);
    const body = (await req.body.json<t.IReqPostNsBody>()) || {};
    return !id || error ? { status, data: { error } } : postNs({ host, db, id, body, query });
  });

  /**
   * GET types
   */
  router.get(routes.NS.TYPES, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryNsTypes;
    const { status, id, error } = getParams(req);
    return !id || error ? { status, data: { error } } : getTypes({ host, db, id, query });
  });
}
