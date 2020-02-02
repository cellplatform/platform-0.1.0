import { models, Schema, t } from '../common';
import * as util from './util';

export async function getNs(args: {
  db: t.IDb;
  id: string;
  host: string;
  query: t.IUrlQueryNsInfo;
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

  const urls: t.IResGetNsUrls = util.urls(host).ns(uri).urls;
  const res: t.IResGetNs = {
    uri,
    exists,
    createdAt,
    modifiedAt,
    data,
    urls,
  };

  return { status: 200, data: res };
}

export async function getNsData(args: {
  model: t.IDbModelNs;
  query: t.IUrlQueryNsInfo;
}): Promise<Partial<t.INsDataChildren> | t.IErrorPayload> {
  try {
    const { model, query } = args;
    if (Object.keys(query).length === 0) {
      return {};
    }

    const cells = query.data ? true : util.formatQuery(query.cells);
    const columns = query.data ? true : util.formatQuery(query.columns);
    const rows = query.data ? true : util.formatQuery(query.rows);
    const files = query.data ? true : query.files; // NB: boolean flag, no range selection.

    return await models.ns.getChildData({ model, cells, columns, rows, files });
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
