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

  const hash = '-'; // TODO 🐷

  const exists = Boolean(model.exists);
  const { createdAt, modifiedAt } = model;

  // model.props
  // model.props

  // const ns: t.INs = { id, hash, props: model.toObject() };
  const ns: t.INs = model.toObject();

  // ns.
  const data: t.IGetNsResponseData = { ns, ...(await getNsData({ model, query })) };

  // data: args.dataQuery ? await getNsData({ model, data: args.dataQuery }) : {},

  const res: t.IGetNsResponse = {
    uri,
    exists,
    createdAt,
    modifiedAt,
    data,
  };
  return { status: 200, data: res };
}

async function getNsData(args: { model: t.IDbModelNs; query: t.IReqNsQuery }) {
  const { model, query } = args;
  const f = await ns.childData(model);

  console.log('f', f);

  return {};
}

async function postNsResponse(args: {
  db: t.IDb;
  id: string;
  body: t.IPostNsBody;
  query: t.IReqNsQuery;
}) {
  const { db, id, body, query } = args;
  const cells = (body.data || {}).cells || {};
  let isChanged = false;

  // Save cells.
  const wait = Object.keys(cells).map(async key => {
    const cell = cells[key];
    if (typeof cell === 'object') {
      const uri = Uri.string.cell(id, key);
      const model = (await Cell.create({ db, uri }).ready).set(cell);
      if (model.isChanged) {
        isChanged = true;
        await model.save();
      }
    }
  });

  await Promise.all(wait);

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

export function parseQueryData(query: t.ReqNsQueryData) {
  // todo
}
