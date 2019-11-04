import { t, cell } from '../common';

const { Uri, model, Schema } = cell;
const { Ns } = model.db;

/**
 * Namespace routes.
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  const getModel = async (id: string) => {
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

  const getCells = async (model: t.IDbModelNs) => {
    const models = await model.children.cells;
    return models.reduce((acc, next) => {
      const { parts } = Schema.from.cell(next);
      acc[parts.key] = cell.value.squash.cell(next.toObject());
      return acc;
    }, {}) as t.ICellMap;
  };

  const getRows = async (model: t.IDbModelNs) => {
    const models = await model.children.rows;
    return models.reduce((acc, next) => {
      const { parts } = Schema.from.row(next);
      acc[parts.key] = cell.value.squash.object(next.toObject());
      return acc;
    }, {}) as t.ICellMap;
  };

  const getColumns = async (model: t.IDbModelNs) => {
    const models = await model.children.columns;
    return models.reduce((acc, next) => {
      const { parts } = Schema.from.column(next);
      acc[parts.key] = cell.value.squash.object(next.toObject());
      return acc;
    }, {}) as t.ICellMap;
  };

  const toData = async (model: t.IDbModelNs) => {
    const wait = [
      { field: 'cells', method: getCells },
      { field: 'rows', method: getRows },
      { field: 'columns', method: getColumns },
    ].map(async ({ field, method }) => ({ field, value: await method(model) }));

    return (await Promise.all(wait)).reduce((acc, next) => {
      acc[next.field] = next.value;
      return acc;
    }, {}) as t.INsCoordData;
  };

  /**
   * Root: info
   */
  router.get(`/ns\::id(.*)/`, async req => {
    const { response } = await getModel(req.params.id);
    return { status: 200, data: response };
  });

  /**
   * Namespace data.
   */
  router.get(`/ns\::id(.*)/data`, async req => {
    const id = req.params.id;
    const { model, response } = await getModel(id);

    const data = {
      ns: { id },
      ...(await toData(model)),
    };

    const res: t.IResNsData = {
      ...response,
      data,
    };

    return { status: 200, data: res };
  });
}
