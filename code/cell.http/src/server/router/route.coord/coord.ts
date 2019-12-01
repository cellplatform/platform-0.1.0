import { util, cell, ERROR, models, ROUTES, Schema, t } from '../common';

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
    const params = args.req.params as t.IReqCoordParams;

    const data = {
      ns: (params.ns || '').toString(),
      key: (params.key || '').toString(),
      uri: '',
    };

    const error: t.IError = {
      type: ERROR.MALFORMED_URI,
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
   * GET /cell:<id>!A1
   */
  router.get(ROUTES.CELL.BASE, async req => {
    const query = req.query as t.IReqCoordQuery;
    const { status, uri, error } = getParams({
      req,
      prefix: 'cell',
      getUri: (id, key) => Schema.uri.create.cell(id, key),
    });
    const getModel: t.GetModel = () => models.Cell.create({ db, uri }).ready;
    return error ? { status, data: { error } } : getCoordResponse<t.IResGetCell>({ uri, getModel });
  });

  /**
   * GET /row:<id>!1
   */
  router.get(ROUTES.ROW.BASE, async req => {
    const query = req.query as t.IReqCoordQuery;
    const { status, uri, error } = getParams({
      req,
      prefix: 'row',
      getUri: (id, key) => Schema.uri.create.row(id, key),
    });
    const getModel: t.GetModel = () => models.Row.create({ db, uri }).ready;
    return error ? { status, data: { error } } : getCoordResponse<t.IResGetRow>({ uri, getModel });
  });

  /**
   * GET /col:<id>!A
   */
  router.get(ROUTES.COLUMN.BASE, async req => {
    const query = req.query as t.IReqCoordQuery;
    const { status, uri, error } = getParams({
      req,
      prefix: 'col',
      getUri: (id, key) => Schema.uri.create.column(id, key),
    });
    const getModel: t.GetModel = () => models.Column.create({ db, uri }).ready;
    return error ? { status, data: { error } } : getCoordResponse<t.IResGetRow>({ uri, getModel });
  });
}

/**
 * [Helpers]
 */

async function getCoordResponse<T extends t.IUriResponse<any>>(args: {
  uri: string;
  getModel: t.GetModel;
}) {
  try {
    const { uri } = args;
    const model = await args.getModel();
    const exists = Boolean(model.exists);
    const { createdAt, modifiedAt } = model;

    const data = cell.value.squash.object(model.toObject()) || {};

    const res = {
      uri,
      exists,
      createdAt,
      modifiedAt,
      data,
    };

    return { status: 200, data: res as T };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
