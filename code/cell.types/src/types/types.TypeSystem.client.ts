import { t } from '../common';

/**
 * Type Client
 */

export type ITypeClient = {
  readonly ok: boolean;
  readonly uri: string;
  readonly typename: string;
  readonly types: t.IColumnTypeDef[];
  readonly errors: t.IError[];
  typescript(args?: ITypeClientTypescriptArgs): string;
  load(): Promise<ITypeClient>;
  save(fs: t.IFs): ITypeClientSaver;
};

export type ITypeClientSaver = {
  typescript(dir: string, options?: { filename?: string }): Promise<ITypeClientTypescriptSaved>;
};

export type ITypeClientSaveArgs = { fs: t.IFs; dir: string; filename?: string };
export type ITypeClientTypescriptSaved = { path: string; data: string };
export type ITypeClientTypescriptArgs = { header?: boolean };
