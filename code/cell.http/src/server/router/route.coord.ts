import { cell, t, models } from '../common';
import { ROUTES } from './ROUTES';
import { toErrorPayload } from './util';

const { Uri } = cell;
type GetModel = () => Promise<t.IModel>;

/**
 * Coordinate routes (cell: | row: | col:).
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
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
      id: (params.id || '').toString(),
      key: (params.key || '').toString(),
      uri: '',
    };

    const error: t.IError = {
      type: 'HTTP/uri/malformed',
      message: '',
    };

    const toMessage = (msg: string) => `Malformed "${prefix}:" URI, ${msg} ("${req.url}").`;

    if (!data.id) {
      error.message = toMessage('does not contain an ID');
      return { ...data, status: 400, error };
    }

    if (!data.key) {
      error.message = toMessage('does not contain a coordinate position');
      return { ...data, status: 400, error };
    }

    try {
      data.uri = args.getUri(data.id, data.key);
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
      getUri: (id, key) => Uri.string.cell(id, key),
    });
    const getModel: GetModel = () => models.Cell.create({ db, uri }).ready;
    return error
      ? { status, data: { error } }
      : getCoordResponse<t.IResGetCell>({ uri, getModel });
  });

  /**
   * GET /row:<id>!1
   */
  router.get(ROUTES.ROW.BASE, async req => {
    const query = req.query as t.IReqCoordQuery;
    const { status, uri, error } = getParams({
      req,
      prefix: 'row',
      getUri: (id, key) => Uri.string.row(id, key),
    });
    const getModel: GetModel = () => models.Row.create({ db, uri }).ready;
    return error
      ? { status, data: { error } }
      : getCoordResponse<t.IResGetRow>({ uri, getModel });
  });

  /**
   * GET /col:<id>!A
   */
  router.get(ROUTES.COLUMN.BASE, async req => {
    const query = req.query as t.IReqCoordQuery;
    const { status, uri, error } = getParams({
      req,
      prefix: 'col',
      getUri: (id, key) => Uri.string.column(id, key),
    });
    const getModel: GetModel = () => models.Column.create({ db, uri }).ready;
    return error
      ? { status, data: { error } }
      : getCoordResponse<t.IResGetRow>({ uri, getModel });
  });
}

/**
 * [Helpers]
 */

async function getCoordResponse<T extends t.IGetResponse<any>>(args: {
  uri: string;
  getModel: GetModel;
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
    return toErrorPayload(err);
  }
}
