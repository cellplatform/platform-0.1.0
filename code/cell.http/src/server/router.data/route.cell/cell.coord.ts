import { util, cell, ERROR, models, routes, Schema, t } from '../common';

type GetUrls = () => t.IUrlMap;

/**
 * Coordinate routes (cell: | row: | col:).
 */
export function init(args: { db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  type Prefix = 'cell' | 'col' | 'row';
  const getParams = (args: {
    req: t.Request;
    prefix: Prefix;
    getUri: (id: string, key: string) => string;
  }) => {
    const { req, prefix } = args;
    const params = args.req.params as t.IUrlParamsCoord;

    const data = {
      ns: (params.ns || '').toString(),
      key: (params.key || '').toString(),
      uri: '',
    };

    const error: t.IError = {
      type: ERROR.HTTP.MALFORMED_URI,
      message: '',
    };

    const toMessage = (msg: string) => `Malformed "${prefix}:" URI, ${msg} ("${req.url}").`;

    if (!data.ns) {
      error.message = toMessage('does not contain a namespace-identifier');
      return { ...data, status: 400, error };
    }

    if (!data.key) {
      error.message = toMessage('does not contain a coordinate position');
      return { ...data, status: 400, error };
    }

    try {
      data.uri = args.getUri(data.ns, data.key);
    } catch (err) {
      error.message = toMessage(err.message);
      return { ...data, status: 400, error };
    }

    return { ...data, status: 200, error: undefined };
  };

  /**
   * GET: /cell:<id>  (NB: no cell-key on the URL)
   *      Redirect to the namespace.
   */
  router.get(routes.CELL.NS, async req => {
    const params = req.params as t.IUrlParamsNs;
    const ns = Schema.url(req.host).ns(params.ns).info;
    const url = ns.query(req.query).toString();
    return req.redirect(url);
  });

  /**
   * GET /cell:<id>!A1
   */
  router.get(routes.CELL.INFO, async req => {
    const query = req.query as t.IUrlParamsCoord;
    const { status, uri, error } = getParams({
      req,
      prefix: 'cell',
      getUri: (id, key) => Schema.uri.create.cell(id, key),
    });
    const getModel: t.GetModel = () => models.Cell.create({ db, uri }).ready;

    const getUrls: GetUrls = () => util.urls(req.host).cell(uri).urls;
    return error
      ? { status, data: { error } }
      : getCoordResponse<t.IResGetCell>({ uri, getModel, getUrls });
  });

  /**
   * GET /row:<id>!1
   */
  router.get(routes.ROW.INFO, async req => {
    const query = req.query as t.IUrlParamsCoord;
    const { status, uri, error } = getParams({
      req,
      prefix: 'row',
      getUri: (id, key) => Schema.uri.create.row(id, key),
    });
    const getModel: t.GetModel = () => models.Row.create({ db, uri }).ready;
    const getUrls: GetUrls = () => util.urls(req.host).rowUrls(uri);
    return error
      ? { status, data: { error } }
      : getCoordResponse<t.IResGetRow>({ uri, getModel, getUrls });
  });

  /**
   * GET /col:<id>!A
   */
  router.get(routes.COLUMN.INFO, async req => {
    const query = req.query as t.IUrlParamsCoord;
    const { status, uri, error } = getParams({
      req,
      prefix: 'col',
      getUri: (id, key) => Schema.uri.create.column(id, key),
    });
    const getModel: t.GetModel = () => models.Column.create({ db, uri }).ready;
    const getUrls: GetUrls = () => util.urls(req.host).columnUrls(uri);
    return error
      ? { status, data: { error } }
      : getCoordResponse<t.IResGetRow>({ uri, getModel, getUrls });
  });
}

/**
 * [Helpers]
 */

async function getCoordResponse<T extends t.IUriResponse<any, any>>(args: {
  uri: string;
  getModel: t.GetModel;
  getUrls: GetUrls;
}) {
  try {
    const { uri } = args;
    const model = await args.getModel();
    const exists = Boolean(model.exists);
    const { createdAt, modifiedAt } = model;

    const data = cell.value.squash.object(model.toObject()) || {};
    const urls = args.getUrls();

    const res = {
      uri,
      exists,
      createdAt,
      modifiedAt,
      data,
      urls,
    };

    return { status: 200, data: res as T };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
