import { t } from '../common';

/**
 * Parsed details from a single [key] in a cell's { links } object map.
 */
export type ILinkKey = {
  prefix: string;
  key: string;
  path: string;
  dir: string;
  name: string;
  ext: string;
};

/**
 * Parsed details from a single [value] in a cell's { links } object map.
 */
export type ILinkValue<U extends t.IUri, Q extends ILinkQuery> = {
  uri: U;
  value: string;
  query: Q;
};

/**
 * Parsed details from a single item (key and value) in
 * a cell's { links } object map.
 */
export type ILink<U extends t.IUri, Q extends ILinkQuery> = ILinkKey & ILinkValue<U, Q>;
export type ILinkQuery = {};

/**
 * Parsed properties of a file linked to a cell.
 */
export type IFileLink = ILink<t.IFileUri, IFileLinkQuery> & { toString: FileLinkToString };
export type IFileLinkQuery = ILinkQuery & { hash?: string; status?: FileLinkQueryStatus };
export type FileLinkQueryStatus = 'uploading';
export type FileLinkToString = (options?: {
  hash?: string | null;
  status?: string | null;
}) => string;

/**
 * Parsed properties of a linked reference to a [CELL | COLUMN | ROW | NS].
 */
export type IRefLink<U extends IRefLinkUri = IRefLinkUri> = ILink<U, IRefLinkQuery> & {
  toString: RefLinkToString;
};
export type IRefLinkUri = t.INsUri | t.ICellUri | t.IColumnUri | t.IRowUri;
export type IRefLinkQuery = ILinkQuery & { hash?: string };
export type RefLinkToString = (options?: { hash?: string | null }) => string;
