import { t } from '../common';

/**
 * Column
 */
export type IColumnProps = {
  title?: string; // Column display name.
  def?: t.CellTypeDef;
};

export type IColumnData<P extends IColumnProps = IColumnProps> = {
  props?: P;
  hash?: string;
  error?: t.IError;
};
