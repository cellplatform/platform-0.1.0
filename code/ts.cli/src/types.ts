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

/**
 * Commands
 */
export type IResult = {
  code: number;
  error?: Error;
};

export type ITask = {
  title: string;
  task: () => Promise<IResult>;
};

export type ICommand = {
  title: string;
  cmd: string;
};
