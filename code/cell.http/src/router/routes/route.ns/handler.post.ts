import { defaultValue, func, models, Schema, t } from '../common';
import { getNs } from './handler.get';
import * as util from './util';

export async function postNs(args: {
  db: t.IDb;
  id: string;
  body: t.IReqPostNsBody;
  query: t.IUrlQueryNsWrite;
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
    const calc = util.formatQuery(body.calc);
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

    // Retrieve NS data.
    const res = (await getNs({ db, id, query, host })) as t.IPayload<t.IResGetNs>;
    if (util.isErrorPayload(res)) {
      return res;
    }

    // Finish up.
    const data: t.IResPostNs = {
      ...res.data,
      changes: defaultValue(query.changes, true) ? changes : undefined, // NB: don't send if suppressed in query-string (?changes=false)
    };
    return { status: res.status, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
