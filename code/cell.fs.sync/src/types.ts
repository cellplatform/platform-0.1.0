import { t } from './common';
export * from '@platform/cell.types/lib/types/types.fs.sync';

export type IFsConfigDir = {
  exists: boolean | null;
  isValid: boolean;
  dir: string;
  file: string;
  data: IFsConfigDirData;
  targetUri: t.IUriParts<t.ICellUri>;
  load(): Promise<IFsConfigDir>;
  save(data?: t.IFsConfigDirData): Promise<IFsConfigDir>;
  validate(): IFsConfigDirValidation;
};

export type IFsConfigDirData = {
  host: string;
  target: string; // URI: ns|cell
};

export type IFsConfigDirValidation = {
  isValid: boolean;
  errors: t.IError[];
};
