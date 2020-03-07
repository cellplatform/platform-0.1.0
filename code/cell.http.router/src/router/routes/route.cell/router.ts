import { models, routes, Schema, t, util } from '../common';
import { getCoord } from './handler.getCoord';
import { getParams } from './params';

/**
 * Routes for operating on a single cell (CELL|ROW|COLUMN).
 */
export function init(args: { db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * GET: /cell:<id>  (NB: no cell-key on the URL)
   *      REDIRECT to the namespace.
   */
  router.get(routes.CELL.NS, async req => {
    try {
      const params = req.params as t.IUrlParamsNs;
      const ns = Schema.urls(req.host).ns(params.ns).info;
      const url = ns.query(req.query).toString();
      return req.redirect(url);
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET /cell:<id>!A1
   */
  router.get(routes.CELL.INFO, async req => {
    try {
      const query = req.query as t.IUrlParamsCoord;
      const { status, uri, error } = getParams({
        req,
        prefix: 'cell',
        getUri: (id, key) => Schema.uri.create.cell(id, key),
      });
      const getModel: t.GetModel = () => models.Cell.create({ db, uri }).ready;
      const getUrls: t.GetUrls = () => util.urls(req.host).cell(uri).urls;

      return error
        ? { status, data: { error } }
        : getCoord<t.IResGetCell>({ uri, getModel, getUrls });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET /row:<id>!1
   */
  router.get(routes.ROW.INFO, async req => {
    try {
      const query = req.query as t.IUrlParamsCoord;
      const { status, uri, error } = getParams({
        req,
        prefix: 'row',
        getUri: (id, key) => Schema.uri.create.row(id, key),
      });
      const getModel: t.GetModel = () => models.Row.create({ db, uri }).ready;
      const getUrls: t.GetUrls = () => util.urls(req.host).rowUrls(uri);

      return error
        ? { status, data: { error } }
        : getCoord<t.IResGetRow>({ uri, getModel, getUrls });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET /col:<id>!A
   */
  router.get(routes.COLUMN.INFO, async req => {
    try {
      const query = req.query as t.IUrlParamsCoord;
      const { status, uri, error } = getParams({
        req,
        prefix: 'col',
        getUri: (id, key) => Schema.uri.create.column(id, key),
      });
      const getModel: t.GetModel = () => models.Column.create({ db, uri }).ready;
      const getUrls: t.GetUrls = () => util.urls(req.host).columnUrls(uri);

      return error
        ? { status, data: { error } }
        : getCoord<t.IResGetRow>({ uri, getModel, getUrls });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}
