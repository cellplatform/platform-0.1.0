import { t, Model } from '../common';

export class Cell {
  /**
   * Factory for generating cells.
   */
  public static factory: t.ModelFactory<t.IModelCell> = ({ path, db }) => {
    return Model.create<t.IModelCellProps>({ db, path, initial: { key: '' } });
  };
}
