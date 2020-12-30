import { t } from './common';
import { CompilerOptions } from 'typescript';

export type TscDir = { base: string; dirname: string };
export type TscPathTransform = { from: string; to: string };

export type TscConfig = { path: string; json(): Promise<t.TscConfigFile> };
export type TscConfigFile = {
  extends: string;
  include: string[];
  compilerOptions: CompilerOptions;
};

/**
 * Typescript compiler.
 */
export type TscCompiler = {
  readonly tsconfig: t.TscConfig;
  readonly declarations: t.TscDeclarations;
  transpile: t.TscTranspile;
  copy: t.TscCopyBundle;
  copyRefs: t.TscCopyBundleRefs;

  declarations_OLD: TsCompileDeclarations__OLD;
};

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
  tsconfig: TscConfigFile;
  out: { dir: string; manifest: t.TypelibManifest };
  error?: string;
};

/**
 * Copy transpiled bundle
 */
export type TscCopyBundle = (args: TscCopyBundleArgs) => Promise<TscCopyBundleResult>;

export type TscCopyBundleArgs = {
  from: string; // Directory path.
  to: string; // Directory path.
  filter?: (path: string) => boolean;
  transformPath?: (path: string) => string | undefined;
};

export type TscCopyBundleResult = {
  from: TscDir;
  to: TscDir;
  paths: string[];
  transformations: TscPathTransform[];
  manifest: t.TypelibManifest;
};

/**
 * Copy bundle refs (imports/exports).
 */
export type TscCopyBundleRefs = (args: TscCopyBundleArgsRefs) => Promise<TscCopyBundleRefsResult>;

export type TscCopyBundleArgsRefs = {
  dir: string; // Directory of the bundle.
  // from: string; // Directory path.
  // to: string; // Directory path.
  // filter?: (path: string) => boolean;
  // transformPath?: (path: string) => string | undefined;
};

export type TscCopyBundleRefsResult = {
  dir: TscDir;
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
  tsconfig: TscConfigFile;
  output: {
    base: string;
    dir: string;
    manifest: t.TypelibManifest;
  };
  error?: string;
};