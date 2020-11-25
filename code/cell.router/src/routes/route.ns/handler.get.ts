import { models, Schema, t } from '../common';
import * as util from './util';

export async function getNs(args: {
  host: string;
  db: t.IDb;
  id: string;
  query: t.IReqQueryNsInfo;
}): Promise<t.IPayload<t.IResGetNs> | t.IErrorPayload> {
  const { db, id, query, host } = args;
  const uri = Schema.uri.create.ns(id);
  const model = await models.Ns.create({ db, uri }).ready;

  const exists = Boolean(model.exists);
  const { createdAt, modifiedAt } = model;

  type T = { data: Partial<t.INsDataChildren>; totals: Partial<t.INsTotals> };
  const nsDataResponse = await getNsData({ model, query });
  if (util.isErrorPayload(nsDataResponse)) {
    return nsDataResponse as t.IErrorPayload;
  }
  const total = (nsDataResponse as T).totals;

  const data: t.IResGetNsData = {
    ns: await models.ns.toObject(model),
    ...(nsDataResponse as T).data,
  };

  if (Object.keys(total).length > 0) {
    data.total = total;
  }

  const urls: t.IResGetNsUrls = util.urls(host).ns(uri).urls;
  const res: t.IResGetNs = {
    uri,
    exists,
    createdAt,
    modifiedAt,
    data,
    urls,
  };

  const status = exists ? 200 : 404;
  return { status, data: res };
}

export async function getNsData(args: {
  model: t.IDbModelNs;
  query: t.IReqQueryNsInfo;
}): Promise<{ data: Partial<t.INsDataChildren>; totals: Partial<t.INsTotals> } | t.IErrorPayload> {
  try {
    const { model, query } = args;
    if (Object.keys(query).length === 0) {
      return { data: {}, totals: {} };
    }

    // Convert query-string flags into parameters.
    const cells = query.data ? true : util.formatQuery(query.cells);
    const columns = query.data ? true : util.formatQuery(query.columns);
    const rows = query.data ? true : util.formatQuery(query.rows);
    const files = query.data ? true : query.files; // NB: boolean flag, no range selection.
    const total = query.total;

    // Query the database.
    return models.ns.getChildData({ model, cells, columns, rows, files, total });
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
