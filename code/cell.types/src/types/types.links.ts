import { t } from '../common';

export type ILink<U extends t.IUri> = {
  uri: U;
  key: string;
  value: string;
  hash?: string;
  path: string;
  dir: string;
  name: string;
  ext: string;
};

/**
 * Parsed properties of a file linked to a cell.
 */
export type IFileLink = ILink<t.IFileUri> & {
  uri: t.IFileUri;
  status?: string;
};

/**
 * Parsed properties of a linked reference to a [CELL | COLUMN | ROW | NS].
 */
type C = t.INsUri | t.ICellUri | t.IColumnUri | t.IRowUri;
export type IRefLink<U extends C = C> = ILink<U>;
