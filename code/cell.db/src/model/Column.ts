import { t, Model } from '../common';

const initial: t.IModelColumnProps = { key: '' };

export class Column {
  public static factory: t.ModelFactory<t.IModelColumn> = ({ path, db }) => {
    return Model.create<t.IModelColumnProps>({ db, path, initial });
  };
}
