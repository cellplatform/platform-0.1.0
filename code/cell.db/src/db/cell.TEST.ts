import { expect, getTestDb, id, Model, t, time } from '../test';
import { Schema } from '../schema';
import { IRowProps, IColumnProps } from '../common/types';

export type IModelNs = t.IModel<IModelNsProps, IModelNsDoc, IModelNsLinks, IModelNsChildren>;
export type IModelNsProps = { name?: string };
export type IModelNsDoc = IModelNsProps & {};
export type IModelNsLinks = {};
export type IModelNsChildren = {
  cells: IModelCell[];
  rows: IModelRow[];
  columns: IModelColumn[];
};

export type IModelCell = t.IModel<IModelCellProps>;
export type IModelCellProps = { key: string };

export type IModelRow = t.IModel<IModelRowProps>;
export type IModelRowProps = { key: string };

export type IModelColumn = t.IModel<IModelColumnProps>;
export type IModelColumnProps = { key: string };

/**
 *   NS/<cuid>/cell
 */

// const nsFactory: t.ModelFactory<IModelNs> = ({path, db}) => {
// }

const cellFactory: t.ModelFactory = ({ path, db }) =>
  Model.create<IModelCellProps>({ db, path, initial: { key: '' } });

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

    const children: t.IModelChildrenDefs<IModelNsChildren> = {
      cells: { query: Schema.query.cells, factory: cellFactory },
      rows: { query: Schema.query.rows, factory: rowFactory },
      columns: { query: Schema.query.columns, factory: columnFactory },
    };

    const ns = Model.create<IModelNsProps, IModelNsDoc, IModelNsLinks, IModelNsChildren>({
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
