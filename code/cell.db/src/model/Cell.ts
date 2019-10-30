import { t, Model, coord } from '../common';
import { Schema } from '../schema';
const Uri = coord.Uri;

export class Cell {
  public static factory: t.ModelFactory<t.IModelCell> = ({ path, db }) => {
    const initial: t.IModelCellProps = { key: '' };
    return Model.create<t.IModelCellProps>({ db, path, initial });
  };

  public static create(args: { db: t.IDb; uri?: string }) {
    const { db } = args;
    const uri = Uri.parse<t.ICellUri>(args.uri || Uri.generate.cell());
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.data.ns);
    const path = ns.cell(uri.data.cell).path;
    return Cell.factory({ db, path });
  }
}
