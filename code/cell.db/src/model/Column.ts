import { t, Model } from '../common';

export class Column {
  /**
   * Factory for generating columns.
   */
  public static factory: t.ModelFactory<t.IModelColumn> = ({ path, db }) => {
    return Model.create<t.IModelColumnProps>({ db, path, initial: { key: '' } });
  };
}
