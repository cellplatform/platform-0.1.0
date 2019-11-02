import { t, Model, coord } from '../common';
import { Schema } from '../schema';
const Uri = coord.Uri;

export class Row {
  public static factory: t.ModelFactory<t.IDbModelRow> = ({ path, db }) => {
    const initial: t.IDbModelRowProps = { key: '' };
    return Model.create<t.IDbModelRowProps>({ db, path, initial });
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
