import { t, cell, log } from '../common';

const { Uri, model } = cell;
const { Ns, Cell } = model.db;

import { ns } from '../model';

const ROUTE = {
  INFO: `/ns\::id(.*)/`,
  DATA: `/ns\::id(.*)/data`,
};

/**
 * Namespace routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * GET info (root).
   */
  router.get(ROUTE.INFO, async req => {
    const id = req.params.id;
    const { response } = await getNsModelResponse(db, id);
    return { status: 200, data: response };
  });

  /**
   * GET namespace data.
   */
  router.get(ROUTE.DATA, async req => {
    const id = req.params.id;
    const { response } = await getNsModelDataResponse(db, id);
    return { status: 200, data: response };
  });

  /**
   * POST namespace data.
   *      Persists data for the namespace to the DB.
   */
  router.post(ROUTE.DATA, async req => {
    const id = req.params.id;

    // Retrieve body data.
    const body = (await req.body.json<t.IReqNsData>()) || {};
    const cells = (body.data || {}).cells || {};

    // Save cells.
    const wait = Object.keys(cells).map(async key => {
      const cell = cells[key];
      if (typeof cell === 'object') {
        // const m = model.
        const uri = Uri.generate.cell({ ns: id, key });
        const model = Cell.create({ db, uri }).set(cell);
        await model.save();
      }
    });

    await Promise.all(wait);
    // const { model, response } = await getNsModelResponse(db, id);

    /**
     * TODO 🐷
     * - check that id is valid (long enough, cuuid, alpha-numeric)
     * - handle all data types within the NS (not just cells).
     * - error handling on model creation/save
     * - more efficient response (ie. don't re-query DB)
     */

    const { response, uri } = await getNsModelDataResponse(db, id);
    log.info(`${log.cyan('POST')}${log.magenta('/data')}`, uri);

    // Finish up.
    return { status: 200, data: response };
  });
}

/**
 * [Helpers]
 */

const getNsModelResponse = async (db: t.IDb, id: string) => {
  const uri = Uri.generate.ns({ ns: id });
  const model = await Ns.create({ db, uri }).ready;
  const exists = Boolean(model.exists);
  const hash = '-'; // TEMP 🐷
  const { createdAt, modifiedAt } = model;

  const response: t.IResNs = {
    uri,
    exists,
    createdAt,
    modifiedAt,
    hash,
  };

  return { model, response, uri };
};

const getNsModelDataResponse = async (db: t.IDb, id: string) => {
  const { model, response, uri } = await getNsModelResponse(db, id);
  const res: t.IResNsData = {
    ...response,
    data: {
      ns: { id },
      ...(await ns.childData(model)),
    },
  };
  return { model, response: res, uri };
};
