import { t } from '../common';

export type IUriMap = { [key: string]: string };
export type IUriData<D> = { uri: string; data: D };

/**
 * URI Parts (parsed).
 */
export type IUriParts<P extends t.IUri = t.IUri> = {
  ok: boolean;
  uri: string;
  type: P['type'];
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
export type INsUri = { type: 'NS'; id: string; toString(): string };
export type IFileUri = { type: 'FILE'; id: string; ns: string; file: string; toString(): string };

export type ICoordUri = ICellUri | ICoordAxisUri;
export type ICoordUriProps = { id: string; ns: string; key: string; toString(): string };

export type ICellUri = ICoordUriProps & { type: 'CELL' };

export type ICoordAxisUri = IRowUri | IColumnUri;
export type IRowUri = ICoordUriProps & { type: 'ROW' };
export type IColumnUri = ICoordUriProps & { type: 'COLUMN' };
