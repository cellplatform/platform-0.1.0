import { CompilerOptions } from 'typescript';

export type TsConfigFile = {
  extends: string;
  include: string[];
  compilerOptions: CompilerOptions;
};

export type TsCompiler = {
  tsconfig: { path: string; json(): Promise<TsConfigFile> };
  declarations: TsCompileDeclarations;
};

export type TsCompileDeclarations = (
  args: TsCompileDeclarationsArgs,
) => Promise<TsCompileDeclarationsResult>;

export type TsCompileDeclarationsArgs = {
  outfile: string;
  include?: string | string[]; // File or grep pattern, eg: src/foo/**/*
  silent?: boolean;
  clean?: boolean;
};

export type TsCompileDeclarationsResult = {
  tsconfig: { path: string; json: TsConfigFile };
  outfile: string;
  error?: string;
};
