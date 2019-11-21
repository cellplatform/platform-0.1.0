import { cell, log, t } from '../common';
import { ns } from '../model';
import { ROUTES } from './ROUTES';

const { Uri, model } = cell;
const { Ns, Cell } = model.db;

/**
 * Namespace routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  const getRequestId = (req: t.Request) => {
    const params = req.params as t.IReqNsParams;
    const id = params.id.toString();
    if (id) {
      return { status: 200, id };
    } else {
      const error: t.IError = {
        type: 'HTTP/malformed',
        message: `Malformed namespace URI, does not contain an ID ("${req.url}").`,
      };
      return { status: 400, error };
    }
  };

  /**
   * GET namespace data.
   */
  router.get(ROUTES.NS, async req => {
    const query = req.query as t.IReqNsQuery;
    const { status, id, error } = getRequestId(req);
    return !id ? { status, data: { error } } : getNsResponse({ db, id, query });
  });

  /**
   * POST namespace data.
   *      Persists data for the namespace to the DB.
   */
  router.post(ROUTES.NS, async req => {
    const query = req.query as t.IReqNsQuery;
    const { status, id, error } = getRequestId(req);
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
  const model = await Ns.create({ db, uri }).ready;

  // const hash = '-'; // TODO 🐷

  const exists = Boolean(model.exists);
  const { createdAt, modifiedAt } = model;

  const data: t.IGetNsResponseData = {
    ns: model.toObject(),
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
}): Promise<Partial<t.INsCoordData>> {
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

  const cells = formatQuery(query.cells);
  const columns = formatQuery(query.columns);
  const rows = formatQuery(query.rows);

  return ns.getChildData(model, { cells, columns, rows });
}

async function postNsResponse(args: {
  db: t.IDb;
  id: string;
  body: t.IPostNsBody;
  query: t.IReqNsQuery;
}) {
  const { db, id, body, query } = args;
  const data: Partial<t.INsCoordData> = body.data || {};

  const res = await ns.setChildData({ db, id, data });
  const isChanged = res.isChanged;

  // Ensure NS time-stamps are updated.
  if (isChanged) {
    const uri = Uri.string.ns(id);
    const model = await Ns.create({ db, uri }).ready;
    model.props.id = id;
    await model.save();

    /**
     * TODO 🐷
     * -  This will not acutally force a save after the iniital save
     *    because the ID does not change.
     *    - Add a way for models to update their modififed date, without an actual prop change.
     * - Update the hash on the NS (ACTUALLY this would have the effect of fixing above)
     */
  }

  /**
   * TODO 🐷
   * - handle all data types within the NS (not just cells).
   * - error handling on model creation/save
   * - more efficient response (ie. don't re-query DB)
   */

  return getNsResponse({ db, id, query });
}
