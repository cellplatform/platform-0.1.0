import { t } from '../common';

export type IUriMap = { [key: string]: string };

/**
 * URI Parts (parsed).
 */
export type IUriParts<P extends t.IUri = t.IUri> = {
  ok: boolean;
  uri: string;
  parts: P;
  error?: t.IUriError;
  toString(): string;
};

/**
 * URI
 */
export type UriType = IUri['type'];
export type IUri = INsUri | ICoordUri | IFileUri | IUnknownUri;

/**
 * Types
 */
export type IUnknownUri = { type: 'UNKNOWN' };
export type INsUri = { type: 'NS'; id: string };
export type IFileUri = { type: 'FILE'; id: string; ns: string; file: string };

export type ICoordUri = ICellUri | IRowUri | IColumnUri;
export type ICoordUriProps = { id: string; ns: string; key: string };
export type ICellUri = ICoordUriProps & { type: 'CELL' };
export type IRowUri = ICoordUriProps & { type: 'ROW' };
export type IColumnUri = ICoordUriProps & { type: 'COLUMN' };
