import { t, Model } from '../common';
import { Schema } from '../schema';

import { Cell } from './Cell';
import { Row } from './Row';
import { Column } from './Column';

const children: t.IModelChildrenDefs<t.IModelNsChildren> = {
  cells: { query: Schema.query.cells, factory: Cell.factory },
  rows: { query: Schema.query.rows, factory: Row.factory },
  columns: { query: Schema.query.columns, factory: Column.factory },
};

/**
 * Represents a logical collection of cells (aka a "sheet").
 */
export class Ns {
  public static factory: t.ModelFactory<t.IModelNs> = ({ db, path }) => {
    return Model.create<t.IModelNsProps, t.IModelNsDoc, t.IModelNsLinks, t.IModelNsChildren>({
      db,
      path,
      children,
      initial: { name: undefined },
    });
  };

  public static create(args: { db: t.IDb; id?: string }) {
    const { id, db } = args;
    const ns = Schema.ns(id);
    const path = ns.path;
    return Ns.factory({ db, path });
  }
}
