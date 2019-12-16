import * as t from '@platform/cell.types';

export * from '@platform/cell.types/lib/types/types.schema.url';
export * from '@platform/cell.types/lib/types/types.client';

/**
 * TODO 🐷
 * - move to `cell.types`
 */

/**
 * Client (Root)
 */
export type IClient = {
  readonly origin: string;
  cell(input: string | t.IUrlParamsCell): IClientCell;
};

/**
 * Cell
 */
export type IClientCell = {
  readonly uri: t.IUriParts<t.ICellUri>;
  readonly url: t.IUrlsCell;
  info(): t.IClientResponseAsync<t.IResGetCell>;
  readonly file: IClientCellFile;
};

export type IClientCellFile = {
  name(filename: string): IClientCellFileByName;
};

export type IClientCellFileByName = {
  upload(data: ArrayBuffer): t.IClientResponseAsync<t.IResPostCellFile>;
  download(): t.IClientResponseAsync<ReadableStream>;
};
