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
};
