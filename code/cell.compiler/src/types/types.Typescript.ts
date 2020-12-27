import { t } from './common';
import { CompilerOptions } from 'typescript';

export type TsConfigFile = {
  extends: string;
  include: string[];
  compilerOptions: CompilerOptions;
};

/**
 * Typescript compilation.
 */
export type TsCompiler = {
  tsconfig: { path: string; json(): Promise<TsConfigFile> };
  declarations: TsCompileDeclarations;
};

/**
 * Compile declaration files (".d.ts")
 */
export type TsCompileDeclarations = (
  args: TsCompileDeclarationsArgs,
) => Promise<TsCompileDeclarationsResult>;

export type TsCompileDeclarationsArgs = {
  dir: string;
  include?: string | string[]; // File or grep pattern, eg: src/foo/**/*
  silent?: boolean;
  clean?: boolean;
  model?: t.CompilerModel;
};

export type TsCompileDeclarationsResult = {
  tsconfig: { path: string; json: TsConfigFile };
  dir: string;
  error?: string;
};
