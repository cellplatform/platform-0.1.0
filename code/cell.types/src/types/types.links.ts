import { t } from '../common';

type Query = { hash?: string };

/**
 * Parsed details from an item in the cell's { links } object map.
 */
export type ILink<U extends t.IUri, Q extends Query> = {
  uri: U;
  key: string;
  value: string;
  path: string;
  dir: string;
  name: string;
  ext: string;
  query: Q;
};

/**
 * Parsed properties of a file linked to a cell.
 */
export type IFileLink = ILink<t.IFileUri, IFileLinkQuery>;
export type IFileLinkQuery = Query & { status?: string };

/**
 * Parsed properties of a linked reference to a [CELL | COLUMN | ROW | NS].
 */
type C = t.INsUri | t.ICellUri | t.IColumnUri | t.IRowUri;
export type IRefLink<U extends C = C> = ILink<U, IRefLinkQuery>;
export type IRefLinkQuery = Query & { status?: string };
