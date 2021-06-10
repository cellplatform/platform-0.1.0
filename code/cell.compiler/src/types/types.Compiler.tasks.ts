import { t } from './common';

type B = t.CompilerModelBuilder;
type M = t.CompilerModel | t.CompilerModelBuilder;
type File = t.IHttpClientCellFileUpload;

/**
 * Compiler methods.
 */
export type CompilerTasks = {
  bundle: CompilerRunBundle;
  bundleDeclarations: CompilerRunBundleDeclarations;
  watch: CompilerRunWatch;
  devserver: CompilerRunDevserver;
  cell: CompilerCreateCell;
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

/**
 * Uploads a bundled distribution to a target cell.
 */
export type CompilerRunUpload = (args: CompilerRunUploadArgs) => Promise<CompilerUploadResponse>;
export type CompilerRunUploadArgs = {
  config: t.CompilerModel;
  host: string;
  targetCell: string | t.ICellUri;
  targetDir?: string;
  silent?: boolean;
};
export type CompilerUploadResponse = {
  ok: boolean;
  urls: { cell: string; files: string; entry: string; remote: string; manifest: string };
  files: File[];
};

/**
 * Cell compilation target.
 */
export type CompilerCreateCell = (host: string, uri: string | t.ICellUri) => CompilerCell;
export type CompilerCell = {
  host: string;
  uri: t.ICellUri;
  upload: CompilerCellRunUpload;
};

export type CompilerCellRunBundle = (
  config: B,
  options?: CompilerCellRunBundleOptions,
) => Promise<CompilerRunBundleResponse>;
export type CompilerCellRunBundleOptions = { targetDir?: string; silent?: boolean };

export type CompilerCellRunUpload = (
  config: B,
  options?: CompilerCellRunUploadOptions,
) => Promise<CompilerUploadResponse>;
export type CompilerCellRunUploadOptions = {
  targetDir?: string;
  silent?: boolean;
  bundle?: boolean;
};
