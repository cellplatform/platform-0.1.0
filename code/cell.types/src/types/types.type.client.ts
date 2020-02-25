import { t } from '../common';

export type ITypeClient = {
  readonly ok: boolean;
  readonly uri: string;
  readonly typename: string;
  readonly errors: t.IError[];
  readonly types: ITypeDef[];
  readonly typescript: string;
  load(): Promise<ITypeClient>;
  save(args: ITypeClientSaveArgs): Promise<ITypeClientSaveResponse>;
};

export type ITypeClientSaveArgs = { fs: t.IFs; dir: string; filename?: string };
export type ITypeClientSaveResponse = { path: string; data: string };

export type ITypeDef = {
  column: string;
  prop: string;
  type: string | ITypeRef;
  target?: t.CellTypeTarget;
  error?: t.IError;
};

export type ITypeRef = {
  uri: string;
  typename: string;
  types: ITypeDef[];
};
