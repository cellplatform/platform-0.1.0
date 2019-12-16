import * as t from '@platform/cell.types';

export * from '@platform/cell.types/lib/types/types.schema.url';
export * from '@platform/cell.types/lib/types/types.client';

/**
 * TODO 🐷
 * - move to `cell.types`
 */

/**
 * ROOT (CLIENT)
 */
export type IClient = {
  readonly origin: string;
  cell(input: string | t.IUrlParamsCell): IClientCell;
  file(input: string | t.IUrlParamsFile): IClientFile;
};

/**
 * CELL
 */
export type IClientCell = {
  readonly uri: t.IUriParts<t.ICellUri>;
  readonly url: t.IUrlsCell;
  readonly file: IClientCellFile;
  readonly links: IClientCellLinks;
  info(): t.IClientResponseAsync<t.IResGetCell>;
};

export type IClientCellFile = {
  name(filename: string): IClientCellFileByName;
};

export type IClientCellFileByName = {
  upload(data: ArrayBuffer): t.IClientResponseAsync<t.IResPostCellFile>;
  download(): t.IClientResponseAsync<ReadableStream>;
};

export type IClientCellLinks = {};

/**
 * FILE
 */
export type IClientFile = {
  readonly uri: t.IUriParts<t.IFileUri>;
  readonly url: t.IUrlsFile;
  info(): t.IClientResponseAsync<t.IResGetFile>;
};
