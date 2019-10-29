import { expect, getTestDb, id, Model, t, time } from '../test';
import { Schema } from '../schema';
import { IRowProps, IColumnProps } from '../common/types';

/**
 *   NS/<cuid>/cell
 */

// const nsFactory: t.ModelFactory<IModelNs> = ({path, db}) => {
// }

const cellFactory: t.ModelFactory = ({ path, db }) =>
  Model.create<t.IModelCellProps>({ db, path, initial: { key: '' } });

const rowFactory: t.ModelFactory = ({ path, db }) =>
  Model.create<IRowProps>({ db, path, initial: { key: '' } });

const columnFactory: t.ModelFactory = ({ path, db }) =>
  Model.create<IColumnProps>({ db, path, initial: { key: '' } });

describe('db.cell', () => {
  it.only('TMP', async () => {
    const db = await getTestDb({ file: true, reset: true });

    const schema = Schema.ns();

    await db.put(schema.cell().path, { key: 'A1' });
    await db.put(schema.cell('456').path, { key: 'A2' });

    const children: t.IModelChildrenDefs<t.IModelNsChildren> = {
      cells: { query: Schema.query.cells, factory: cellFactory },
      rows: { query: Schema.query.rows, factory: rowFactory },
      columns: { query: Schema.query.columns, factory: columnFactory },
    };

    const ns = Model.create<t.IModelNsProps, t.IModelNsDoc, t.IModelNsLinks, t.IModelNsChildren>({
      db,
      path: schema.path,
      children,
      initial: { name: undefined },
      // load: true,
    });

    await ns.save();

    // await db.compact();

    console.log('m', ns.toObject());
    const c = await ns.children.cells;
    console.log('children', c.map(c => c.toObject()));

    const all = await db.find('**');
    console.log('-------------------------------------------');
    console.log('ff', all.map);
  });
});
