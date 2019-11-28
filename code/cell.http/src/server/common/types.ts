import { IModel } from '@platform/fsdb.types';

export * from '@platform/types';
export * from '@platform/fsdb.types';
export * from '@platform/cell.types';
export * from '@platform/micro/lib/types';
export * from '../../types';

export type GetModel = () => Promise<IModel>;

export type IPackage = {
  name: string;
  version: string;
  scripts?: { [key: string]: string };
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
};
