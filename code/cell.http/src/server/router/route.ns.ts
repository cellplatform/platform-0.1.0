import { t, cell, log } from '../common';
import { ROUTES } from './constants';

const { Uri, model } = cell;
const { Ns, Cell } = model.db;

import { ns } from '../model';

/**
 * Namespace routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * GET info (root).
   */
  router.get(ROUTES.NS.INFO, async req => {
    const id = req.params.id;
    const { response } = await getNsModelResponse(db, id);
    return { status: 200, data: response };
  });

  /**
   * GET namespace data.
   */
  router.get(ROUTES.NS.DATA, async req => {
    const id = req.params.id;
    const { response } = await getNsModelDataResponse(db, id);
    return { status: 200, data: response };
  });

  /**
   * POST namespace data.
   *      Persists data for the namespace to the DB.
   */
  router.post(ROUTES.NS.DATA, async req => {
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

    const { response, uri } = await getNsModelDataResponse(db, id, true);

    log.info(`${log.cyan('POST')} ${log.magenta('/data')}`, `uri:${uri}`);

    // Finish up.
    return { status: 200, data: response };
  });
}

/**
 * [Helpers]
 */

const getNsModelResponse = async (db: t.IDb, id: string, modify?: boolean) => {
  const uri = Uri.generate.ns({ ns: id });
  const model = await Ns.create({ db, uri }).ready;

  if (modify) {
    // model.props.id
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

const getNsModelDataResponse = async (db: t.IDb, id: string, modify?: boolean) => {
  const { model, response, uri } = await getNsModelResponse(db, id, modify);
  const res: t.IResNsData = {
    ...response,
    data: {
      ns: { id },
      ...(await ns.childData(model)),
    },
  };
  return { model, response: res, uri };
};
