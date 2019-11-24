import { cell, t, models } from '../common';
import { ROUTES } from './ROUTES';
import { toErrorPayload } from './util';
import { func } from '../func';

const { Uri } = cell;

/**
 * Namespace routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  const getParams = (req: t.Request) => {
    const params = req.params as t.IReqNsParams;
    const id = (params.id || '').toString();

    if (!id) {
      const error: t.IError = {
        type: 'HTTP/uri/malformed',
        message: `Malformed "ns:" URI, does not contain an ID ("${req.url}").`,
      };
      return { status: 400, error };
    }

    return { status: 200, id };
  };

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
  router.get(ROUTES.NS.BASE, async req => {
    const query = req.query as t.IReqNsQuery;
    const { status, id, error } = getParams(req);
    return !id ? { status, data: { error } } : getNsResponse({ db, id, query });
  });

  /**
   * GET namespace (all data).
   *     Same as calling the base URL with all data query-string flags.
   *     eg:
   *         -/ns:<id>?cells&rows&column
   */
  router.get(ROUTES.NS.DATA, async req => {
    const query: t.IReqNsQuery = { cells: true, rows: true, columns: true };
    const { status, id, error } = getParams(req);
    return !id ? { status, data: { error } } : getNsResponse({ db, id, query });
  });

  /**
   * POST namespace data (save to database).
   */
  router.post(ROUTES.NS.BASE, async req => {
    const query = req.query as t.IReqNsQuery;
    const { status, id, error } = getParams(req);
    const body = (await req.body.json<t.IPostNsBody>()) || {};
    return !id ? { status, data: { error } } : postNsResponse({ db, id, body, query });
  });
}

/**
 * [Helpers]
 */

async function getNsResponse(args: { db: t.IDb; id: string; query: t.IReqNsQuery }) {
  const { db, id, query } = args;
  const uri = Uri.string.ns(id);
  const model = await models.Ns.create({ db, uri }).ready;

  const exists = Boolean(model.exists);
  const { createdAt, modifiedAt } = model;

  const data: t.IGetNsResponseData = {
    ns: await models.ns.toObject(model),
    ...(await getNsData({ model, query })),
  };

  const res: t.IGetNsResponse = {
    uri,
    exists,
    createdAt,
    modifiedAt,
    data,
  };

  return { status: 200, data: res };
}

async function getNsData(args: {
  model: t.IDbModelNs;
  query: t.IReqNsQuery;
}): Promise<Partial<t.INsDataCoord> | t.IErrorPayload> {
  try {
    const { model, query } = args;
    if (Object.keys(query).length === 0) {
      return {};
    }

    const formatQueryArray = (input: Array<string | boolean>) => {
      if (input.some(item => item === true)) {
        // NB: Any occurance of `true` negates narrower string ranges
        //     so default to a blunt [true] so everything is returned.
        return true;
      } else {
        const flat = input.filter(item => typeof item === 'string').join(',');
        return flat ? flat : undefined;
      }
    };

    const formatQuery = (
      input?: boolean | string | Array<string | boolean>,
    ): string | boolean | undefined => {
      return Array.isArray(input) ? formatQueryArray(input) : input;
    };

    const cells = query.data ? true : formatQuery(query.cells);
    const columns = query.data ? true : formatQuery(query.columns);
    const rows = query.data ? true : formatQuery(query.rows);

    return models.ns.getChildData({ model, cells, columns, rows });
  } catch (err) {
    return toErrorPayload(err);
  }
}

async function postNsResponse(args: {
  db: t.IDb;
  id: string;
  body: t.IPostNsBody;
  query: t.IReqNsQuery;
}) {
  try {
    const { db, id, query } = args;
    let body = { ...args.body };
    const uri = Uri.string.ns(id);
    const ns = await models.Ns.create({ db, uri }).ready;

    const changes: t.IDbModelChange[] = [];
    let isNsChanged = false;

    if (body.cells && body.calc) {
      const cells = await models.ns.getChildCells({ model: ns });
      const getCells: t.GetCells = async () => ({ ...cells, ...(body.cells || {}) });
      const calc = func.calc({ getCells });
      const res = await calc.changes({ cells: Object.keys(body.cells) });
      body = { ...body, cells: { ...(body.cells || {}), ...res.map } };
    }

    const saveChildData = async (body: t.IPostNsBody) => {
      const { cells, rows, columns } = body;
      if (cells || rows || columns) {
        const data = { cells, rows, columns };
        const res = await models.ns.setChildData({ ns, data });
        res.changes.forEach(change => changes.push(change));
      }
    };

    const saveNsData = async (body: t.IPostNsBody) => {
      const res = await models.ns.setProps({ ns, data: body.ns });
      if (res.isChanged) {
        isNsChanged = true;
        res.changes.forEach(change => changes.push(change));
      }
    };

    await saveChildData(body);
    await saveNsData(body);

    // Ensure timestamp and hash are updated if the namespace was
    // not directly updated (ie. cells/rows/columns only changed).
    if (!isNsChanged && changes.length > 0) {
      const res = await ns.save({ force: true });
      if (res.isChanged) {
        models.toChanges(uri, res.changes).forEach(change => changes.push(change));
      }
    }
    const res = await getNsResponse({ db, id, query });
    const data: t.IPostNsResponse = { ...res.data, changes };
    const status = res.status;
    return { status, data };
  } catch (err) {
    return toErrorPayload(err);
  }
}
