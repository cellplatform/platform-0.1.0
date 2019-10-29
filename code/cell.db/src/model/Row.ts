import { t, Model } from '../common';

const initial: t.IModelRowProps = { key: '' };

export class Row {
  public static factory: t.ModelFactory<t.IModelRow> = ({ path, db }) => {
    return Model.create<t.IModelRowProps>({ db, path, initial });
  };
}
