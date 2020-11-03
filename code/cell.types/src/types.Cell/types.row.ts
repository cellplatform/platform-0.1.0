import { t } from '../common';

/**
 * Row
 */
export type IRowProps = {
  title?: string; // Row display name.
};

export type IRowData<P extends IRowProps = IRowProps> = {
  props?: P;
  hash?: string;
  error?: t.IError;
};
