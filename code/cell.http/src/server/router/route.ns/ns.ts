import { ERROR, defaultValue, func, models, routes, Schema, t, util } from '../common';

/**
 * Namespace routes.
 */
export function init(args: { db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  const getParams = (req: t.Request) => {
    const params = req.params as t.IReqNsParams;
    const id = (params.ns || '').toString();

    if (!id) {
      const error: t.IError = {
        type: ERROR.MALFORMED_URI,
        message: `Malformed "ns:" URI, does not contain an ID ("${req.url}").`,
      };
      return { status: 400, error };
    }

    return { status: 200, id };
  };

  /**
   * GET: /ns:<id>!A1
   *      Redirect to the cell.
   */
  router.get(routes.NS.CELL, async req => {
    const params = req.params as t.IReqCellParams;
    const path = `/cell:${params.ns}!${params.key}${req.query.toString()}`;
    return req.redirect(path);
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
  router.get(routes.NS.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IReqGetNsQuery;
    const { status, id, error } = getParams(req);
    return !id || error ? { status, data: { error } } : getNsResponse({ db, id, query, host });
  });

  /**
   * GET namespace (all data).
   *     Same as calling the base URL with all data query-string flags.
   *     eg:
   *         -/ns:<id>?cells&rows&column
   */
  router.get(routes.NS.DATA, async req => {
    const host = req.host;
    const query: t.IReqGetNsQuery = { cells: true, rows: true, columns: true };
    const { status, id, error } = getParams(req);
    return !id || error ? { status, data: { error } } : getNsResponse({ db, id, query, host });
  });

  /**
   * POST namespace data (save to database).
   */
  router.post(routes.NS.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IReqPostNsQuery;
    const { status, id, error } = getParams(req);
    const body = (await req.body.json<t.IReqPostNsBody>()) || {};
    return !id || error
      ? { status, data: { error } }
      : postNsResponse({ db, id, body, query, host });
  });
}

/**
 * [Methods]
 */

export async function getNsResponse(args: {
  db: t.IDb;
  id: string;
  host: string;
  query: t.IReqGetNsQuery;
}) {
  const { db, id, query, host } = args;
  const uri = Schema.uri.create.ns(id);
  const model = await models.Ns.create({ db, uri }).ready;

  const exists = Boolean(model.exists);
  const { createdAt, modifiedAt } = model;

  const data: t.IResGetNsData = {
    ns: await models.ns.toObject(model),
    ...(await getNsData({ model, query })),
  };

  const links: t.IResGetNsLinks = util.url(host).nsLinks(uri);
  const res: t.IResGetNs = {
    uri,
    exists,
    createdAt,
    modifiedAt,
    data,
    links,
  };

  return { status: 200, data: res };
}

async function getNsData(args: {
  model: t.IDbModelNs;
  query: t.IReqGetNsQuery;
}): Promise<Partial<t.INsDataCoord> | t.IErrorPayload> {
  try {
    const { model, query } = args;
    if (Object.keys(query).length === 0) {
      return {};
    }

    const cells = query.data ? true : formatQuery(query.cells);
    const columns = query.data ? true : formatQuery(query.columns);
    const rows = query.data ? true : formatQuery(query.rows);

    return models.ns.getChildData({ model, cells, columns, rows });
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

export async function postNsResponse(args: {
  db: t.IDb;
  id: string;
  body: t.IReqPostNsBody;
  query: t.IReqPostNsQuery;
  host: string;
}) {
  try {
    const { db, id, query, host } = args;
    let body = { ...args.body };
    const uri = Schema.uri.create.ns(id);
    const ns = await models.Ns.create({ db, uri }).ready;

    const changes: t.IDbModelChange[] = [];
    let isNsChanged = false;

    // Calculation REFs and functions.
    const calc = formatQuery(body.calc);
    if (calc) {
      const calculate = func.calc({ host, ns, cells: body.cells });
      const range = typeof calc === 'string' ? calc : undefined;
      const res = await calculate.changes({ range });
      body = { ...body, cells: { ...(body.cells || {}), ...res.map } };
    }

    // Data persistence.
    const saveChildData = async (body: t.IReqPostNsBody) => {
      const { cells, rows, columns } = body;
      if (cells || rows || columns) {
        const data = { cells, rows, columns };
        const res = await models.ns.setChildData({ ns, data });
        res.changes.forEach(change => changes.push(change));
      }
    };

    const saveNsData = async (body: t.IReqPostNsBody) => {
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

    // Finish up.
    const res = await getNsResponse({ db, id, query, host });
    const data: t.IResPostNs = {
      ...res.data,
      changes: defaultValue(query.changes, true) ? changes : undefined, // NB: don't send if suppressed in query-string (?changes=false)
    };
    return { status: res.status, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

/**
 * [Helpers]
 */

const formatQueryArray = (input: Array<string | boolean>) => {
  if (input.some(item => item === false)) {
    // NB: Any explicit FALSE refs win.
    // The operation is not wanted irrespective of other requests.
    return false;
  }

  if (input.some(item => item === true)) {
    // NB: Any occurance of `true` negates narrower string ranges
    //     so default to a blunt `true` so everything is returned.
    return true;
  }

  // Convert array of string to a single-flat-string.
  const flat = input.filter(item => typeof item === 'string').join(',');
  return flat ? flat : undefined;
};

const formatQuery = (
  input?: boolean | string | Array<string | boolean>,
): string | boolean | undefined => {
  return Array.isArray(input) ? formatQueryArray(input) : input;
};
