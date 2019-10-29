import { t, Model } from '../common';

export class Row {
  /**
   * Factory for generating rows.
   */
  public static factory: t.ModelFactory<t.IModelRow> = ({ path, db }) => {
    return Model.create<t.IModelRowProps>({ db, path, initial: { key: '' } });
  };
}
