import { t, Model } from '../common';

const initial: t.IModelCellProps = { key: '' };

export class Cell {
  public static factory: t.ModelFactory<t.IModelCell> = ({ path, db }) => {
    return Model.create<t.IModelCellProps>({ db, path, initial });
  };

  public static create(args: { db: t.IDb; uri?: string }) {
    // const { id, db } = args;
    // const ns = Schema.ns(id);
    // const path = ns.path;
    // return Ns.factory({ db, path });
  }
}
