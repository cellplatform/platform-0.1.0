import { t } from './common';
import { CompilerOptions } from 'typescript';

export type TsConfigFile = {
  extends: string;
  include: string[];
  compilerOptions: CompilerOptions;
};

/**
 * Typescript compiler.
 */
export type TsCompiler = {
  tsconfig: t.TsCompilerConfig;
  declarations: TsCompileDeclarations__OLD;

  transpile: t.TsCompilerTranspile;
};

export type TsCompilerConfig = { path: string; json(): Promise<t.TsConfigFile> };

/**
 * Transpile a project
 */

export type TsCompilerTranspile = (
  args: TsCompilerTranspileArgs,
) => Promise<TsCompilerTranspileResult>;

export type TsCompilerTranspileArgs = {
  dir: string;
  include: string | string[]; // File or glob pattern, eg: src/foo/**/*
  silent?: boolean;
};

export type TsCompilerTranspileResult = {
  tsconfig: TsConfigFile;
  out: { dir: string; manifest: t.TypelibManifest };
  error?: string;
};

/**
 * Tools for compiling ".d.ts" declarations
 */
// export type TsDeclarationsCompiler = {
//   transpile(
//     args: TsDeclarationsCompilerTranspileArgs,
//   ): Promise<TsDeclarationsCompilerTranspileResult>;
// };

// export type TsDeclarationsCompilerTranspileArgs = {};

// export type TsDeclarationsCompilerTranspileResult = {
//   tsconfig: TsConfigFile;
//   output: { dir: string; manifest: t.TypelibManifest };
//   error?: string;
// };

// =================================================

/**
 * Compile declaration files (".d.ts")
 */
export type TsCompileDeclarations__OLD = (
  args: TsCompileDeclarationsArgs__OLD,
) => Promise<TsCompileDeclarationsResult__OLD>;

export type TsCompileDeclarationsArgs__OLD = {
  base: string;
  dir: string;
  include: string | string[]; // File or glob pattern, eg: src/foo/**/*
  silent?: boolean;
  clean?: boolean;
  model?: t.CompilerModel;
};

export type TsCompileDeclarationsResult__OLD = {
  tsconfig: TsConfigFile;
  output: {
    base: string;
    dir: string;
    manifest: t.TypelibManifest;
  };
  error?: string;
};
