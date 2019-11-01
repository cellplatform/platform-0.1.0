import { t, Model, coord } from '../common';
import { Schema } from '../schema';
const Uri = coord.Uri;

export class Cell {
  public static factory: t.ModelFactory<t.IModelCell> = ({ path, db }) => {
    const initial: t.IModelCellProps = {
      value: undefined,
      props: undefined,
      hash: undefined,
      error: undefined,
    };
    return Model.create<t.IModelCellProps>({ db, path, initial });
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
