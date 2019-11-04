import { t, cell } from '../common';

const { Uri, model } = cell;
const { Ns } = model.db;

import { ns } from '../model';

/**
 * Namespace routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * Root: info
   */
  router.get(`/ns\::id(.*)/`, async req => {
    const id = req.params.id;
    const { response } = await getNsModel(db, id);
    return { status: 200, data: response };
  });

  /**
   * Namespace data.
   */
  router.get(`/ns\::id(.*)/data`, async req => {
    const id = req.params.id;
    const { model, response } = await getNsModel(db, id);

    const data = {
      ns: { id },
      ...(await ns.childData(model)),
    };

    const res: t.IResNsData = {
      ...response,
      data,
    };

    return { status: 200, data: res };
  });
}

/**
 * [Helpers]
 */

const getNsModel = async (db: t.IDb, id: string) => {
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
