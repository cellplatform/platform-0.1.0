import { t, Model, coord } from '../common';
import { Schema } from '../schema';
const Uri = coord.Uri;

export class Row {
  public static factory: t.ModelFactory<t.IModelRow> = ({ path, db }) => {
    const initial: t.IModelRowProps = { key: '' };
    return Model.create<t.IModelRowProps>({ db, path, initial });
  };

  public static create(args: { db: t.IDb; uri?: string }) {
    const { db } = args;
    const uri = Uri.parse<t.IRowUri>(args.uri || Uri.generate.row());
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.data.ns);
    const path = ns.row(uri.data.row).path;
    return Row.factory({ db, path });
  }
}
