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
export type TscCompiler = {
  readonly tsconfig: t.TsCompilerConfig;
  readonly declarations: t.TscDeclarations;
  transpile: t.TscTranspile;
  copy: t.TscCopyBundle;

  declarations_OLD: TsCompileDeclarations__OLD;
};

export type TsCompilerConfig = { path: string; json(): Promise<t.TsConfigFile> };

/**
 * Generic [tsc] transpiler.
 */
export type TscTranspile = (args: TscTranspileArgs) => Promise<TscTranspileResult>;

export type TscTranspileArgs = {
  outdir: string;
  source?: string | string[]; // File or glob pattern, eg: src/foo/**/*
  silent?: boolean;
  spinnerLabel?: string;
  compilerOptions?: CompilerOptions;
  model?: t.CompilerModel;
};

export type TscTranspileResult = {
  tsconfig: TsConfigFile;
  out: { dir: string; manifest: t.TypelibManifest };
  error?: string;
};

/**
 * Copy transpiled bundle
 */

export type TscCopyBundle = (args: TscCopyBundleArgs) => Promise<TscCopyBundleResult>;

export type TscCopyDir = { base: string; dirname: string };

export type TscCopyBundleArgs = {
  from: string; // Directory path.
  to: string; // Directory path.
  filter?: (path: string) => boolean;
};

export type TscCopyBundleResult = {
  from: TscCopyDir;
  to: TscCopyDir;
  paths: string[];
};

/**
 * Tools for compiling ".d.ts" declarations
 */
export type TscDeclarations = {
  transpile: TscTranspileDeclarations;
};

export type TscTranspileDeclarations = (
  args: TscTranspileDeclarationsArgs,
) => Promise<TscTranspileDeclarationsResult>;

export type TscTranspileDeclarationsArgs = {
  outdir: string;
  source?: string | string[]; // File or glob pattern, eg: src/foo/**/*
  silent?: boolean;
  model?: t.CompilerModel;
};

export type TscTranspileDeclarationsResult = TscTranspileResult;

// ===================== 🐷  OLD   ============================
// ===================== 🐷  OLD   ============================
// ===================== 🐷  OLD   ============================
// ===================== 🐷  OLD   ============================

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
