import { t, Model, coord } from '../common';
import { Schema } from '../schema';
const Uri = coord.Uri;

export class Column {
  public static factory: t.ModelFactory<t.IModelColumn> = ({ path, db }) => {
    const initial: t.IModelColumnProps = { key: '' };
    return Model.create<t.IModelColumnProps>({ db, path, initial });
  };

  public static create(args: { db: t.IDb; uri: string }) {
    const { db } = args;
    const uri = Uri.parse<t.IColumnUri>(args.uri);
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.data.ns);
    const path = ns.column(uri.data.key).path;
    return Column.factory({ db, path });
  }
}
