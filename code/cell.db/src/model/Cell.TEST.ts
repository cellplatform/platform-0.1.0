import { model } from '.';
import { Schema } from '../schema';
import { getTestDb, Model, t } from '../test';

/**
 *   NS/<cuid>/cell
 */

describe('model.Cell', () => {
  it.skip('TMP', async () => {
    const db = await getTestDb({ file: true, reset: true });

    const id = 'ns1';
    const schema = Schema.ns(id);

    await db.put(schema.cell().path, { key: 'A1' });
    await db.put(schema.cell('456').path, { key: 'A2' });

    const m = model.Ns.create({ db, id });

    // const children: t.IModelChildrenDefs<t.IModelNsChildren> = {
    //   cells: { query: Schema.query.cells, factory: model.Cell.factory },
    //   rows: { query: Schema.query.rows, factory: model.Row.factory },
    //   columns: { query: Schema.query.columns, factory: model.Column.factory },
    // };

    // const model = Model.create<t.IModelNsProps, t.IModelNsDoc, t.IModelNsLinks, t.IModelNsChildren>(
    //   {
    //     db,
    //     path: schema.path,
    //     children,
    //     initial: { name: undefined },
    //     // load: true,
    //   },
    // );

    // ns.children.

    // await model.save();

    // await db.compact();

    // console.log('m', ns.toObject());
    const c = await m.children.cells;
    console.log('children', c.map(c => c.toObject()));

    const all = await db.find('**');
    console.log('-------------------------------------------');
    console.log('ff', all.map);
  });
});
