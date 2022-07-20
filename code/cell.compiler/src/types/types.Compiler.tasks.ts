import { t } from './common';

type B = t.CompilerModelBuilder;
type M = t.CompilerModel | t.CompilerModelBuilder;

/**
 * Compiler methods.
 */
export type CompilerTasks = {
  bundle: CompilerRunBundle;
  bundleDeclarations: CompilerRunBundleDeclarations;
  watch: CompilerRunWatch;
  devserver: CompilerRunDevserver;
};

/**
 * Compiles the project.
 */
export type CompilerRunBundle = (
  input: M,
  options?: { silent?: boolean },
) => Promise<CompilerRunBundleResponse>;
export type CompilerRunBundleResponse = {
  ok: boolean;
  elapsed: number;
  stats: t.WebpackStats;
  model: t.CompilerModel;
  webpack: t.WpConfig;
  dir: string;
  toString(): string;
};

export type CompilerRunBundleDeclarations = (
  input: M,
  options?: { silent?: boolean; zip?: boolean },
) => Promise<CompilerRunBundleDeclarationsResponse>;
export type CompilerRunBundleDeclarationsResponse = {
  ok: boolean;
  elapsed: number;
  model: t.CompilerModel;
  dir: string;
  toString(): string;
};

/**
 * Compiles the project and watches for file changes.
 */
export type CompilerRunWatch = (input: M) => Promise<void>;

/**
 * Starts the development-server with HMR (hot-module-reloading).
 */
export type CompilerRunDevserver = (
  input: M,
  options?: CompilerRunDevserverOptions,
) => Promise<void>;
export type CompilerRunDevserverOptions = { exports?: boolean; port?: number };

export type CompilerCellRunBundle = (
  config: B,
  options?: CompilerCellRunBundleOptions,
) => Promise<CompilerRunBundleResponse>;
export type CompilerCellRunBundleOptions = { targetDir?: string; silent?: boolean };
