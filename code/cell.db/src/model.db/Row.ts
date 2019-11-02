import { t, Model, coord } from '../common';
import { Schema } from '../schema';
const Uri = coord.Uri;

export class Row {
  public static factory: t.ModelFactory<t.IModelRow> = ({ path, db }) => {
    const initial: t.IModelRowProps = { key: '' };
    return Model.create<t.IModelRowProps>({ db, path, initial });
  };

  public static create(args: { db: t.IDb; uri: string }) {
    const { db } = args;
    const uri = Uri.parse<t.IRowUri>(args.uri);
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.parts.ns);
    const path = ns.row(uri.parts.key).path;
    return Row.factory({ db, path });
  }
}
