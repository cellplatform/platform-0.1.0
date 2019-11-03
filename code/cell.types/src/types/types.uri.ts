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
export type IUri = INsUri | ICoordUri | IUnknownUri;

/**
 * Types
 */
export type IUnknownUri = { type: 'UNKNOWN' };
export type INsUri = { type: 'ns'; id: string };

export type ICoordUri = ICellUri | IRowUri | IColumnUri;
export type ICoordUriProps = { id: string; key: string; ns: string };
export type ICellUri = ICoordUriProps & { type: 'cell' };
export type IRowUri = ICoordUriProps & { type: 'row' };
export type IColumnUri = ICoordUriProps & { type: 'col' };
