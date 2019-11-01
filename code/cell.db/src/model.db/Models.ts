import { t, Model, coord } from '../common';
import { Schema } from '../schema';

import { Row } from './Row';
import { Column } from './Column';

const Uri = coord.Uri;

/**
 * Represents a logical collection of cells (aka a "sheet").
 */
export class Ns {
  public static factory: t.ModelFactory<t.IModelNs> = ({ db, path }) => {
    const query = Schema.query;

    const children: t.IModelChildrenDefs<t.IModelNsChildren> = {
      cells: { query: query.cells, factory: Cell.factory },
      rows: { query: query.rows, factory: Row.factory },
      columns: { query: query.columns, factory: Column.factory },
    };

    const initial: t.IModelNsProps = { name: undefined };

    return Model.create<t.IModelNsProps, t.IModelNsDoc, t.IModelNsLinks, t.IModelNsChildren>({
      db,
      path,
      children,
      initial,
    });
  };

  public static create(args: { db: t.IDb; uri?: string }) {
    const { uri, db } = args;
    const ns = Schema.ns(uri);
    const path = ns.path;
    return Ns.factory({ db, path });
  }
}

/**
 * Represetns a single cell within a namespace.
 */
export class Cell {
  public static factory: t.ModelFactory<t.IModelCell> = ({ path, db }) => {
    const initial: t.IModelCellProps = {
      value: undefined,
      props: undefined,
      hash: undefined,
      error: undefined,
    };

    const links: t.IModelLinkDefs<t.IModelCellLinks> = {
      namespaces: {
        relationship: '1:*',
        field: 'nsRefs',
        factory: Ns.factory,
      },
    };

    return Model.create<t.IModelCellProps, t.IModelCellDoc, t.IModelCellLinks, t.IModelCellChilden>(
      {
        db,
        path,
        initial,
        links,
      },
    );
  };

  public static create(args: { db: t.IDb; uri: string }) {
    const { db } = args;
    const uri = Uri.parse<t.ICellUri>(args.uri);
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.data.ns);
    const path = ns.cell(uri.data.key).path;
    return Cell.factory({ db, path });
  }
}
