/**
 * Commands.
 */
export { IResult, IResultInfo, ITask, ICommand } from '@platform/util.exec';

/**
 * Configuration files.
 */
export type ITypescriptConfig = {
  extends?: string;
  compilerOptions?: {
    outDir?: string;
    rootDir?: string;
  };
};

export type IPackageJson = {
  name?: string;
  description?: string;
  main?: string;
  types?: string;
  dependencies?: IPackageFieldMap;
  devDependencies?: IPackageFieldMap;
  scripts?: IPackageFieldMap;
  files?: string[];
};

export type IPackageFieldMap = { [key: string]: string };
