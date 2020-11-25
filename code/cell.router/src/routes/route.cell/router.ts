/* eslint-disable @typescript-eslint/no-unused-vars */

import { models, routes, Schema, t, util } from '../common';
import { getCoord } from './handler.getCoord';
import { cellInfo, rowInfo, columnInfo } from './handler.info';
import { getParams } from './params';

/**
 * Routes for operating on a single cell (CELL | ROW | COLUMN).
 */
export function init(args: { db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * GET: /cell:<ns>  (NB: no cell-key on the URL)
   *      REDIRECT to the namespace.
   */
  router.get(routes.CELL.NS, async (req) => {
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
   * GET /cell:<ns>:A1
   */
  router.get(routes.CELL.INFO, async (req) => {
    try {
      const host = req.host;
      const query = req.query as t.IUrlParamsCoord;
      const { status, uri, error } = getParams({
        req,
        prefix: 'cell',
        getUri: (id, key) => Schema.uri.create.cell(id, key),
      });
      return error ? { status, data: { error } } : cellInfo({ host, db, uri });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET /cell:<ns>:1
   */
  router.get(routes.ROW.INFO, async (req) => {
    try {
      const host = req.host;
      const query = req.query as t.IUrlParamsCoord;
      const { status, uri, error } = getParams({
        req,
        prefix: 'row',
        getUri: (id, key) => Schema.uri.create.row(id, key),
      });
      return error ? { status, data: { error } } : rowInfo({ host, db, uri });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET /cell:<ns>:A
   */
  router.get(routes.COLUMN.INFO, async (req) => {
    try {
      const host = req.host;
      const query = req.query as t.IUrlParamsCoord;
      const { status, uri, error } = getParams({
        req,
        prefix: 'col',
        getUri: (id, key) => Schema.uri.create.column(id, key),
      });
      return error ? { status, data: { error } } : columnInfo({ host, db, uri });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}
