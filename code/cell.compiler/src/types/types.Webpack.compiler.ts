import { t } from './common';

type B = t.ConfigBuilderChain;
type M = t.WebpackModel | t.ConfigBuilderChain;
type File = t.IHttpClientCellFileUpload;

/**
 * Compiler methods.
 */
export type WebpackCompiler = {
  bundle: WebpackBundle;
  watch: WebpackWatch;
  dev: WebpackDev;
  upload: WebpackUpload;
  cell: WebpackCell;
};

/**
 * Compiles the project.
 */
export type WebpackBundle = (
  input: M,
  options?: { silent?: boolean },
) => Promise<WebpackBundleResponse>;
export type WebpackBundleResponse = {
  ok: boolean;
  elapsed: number;
  stats: t.WebpackStats;
  model: t.WebpackModel;
  config: t.WpConfig;
  toString(): string;
};

/**
 * Compiles the project and watches for file changes.
 */
export type WebpackWatch = (input: M) => Promise<void>;

/**
 * Starts the development-server with HMR (hot-module-reloading).
 */
export type WebpackDev = (input: M) => Promise<void>;

/**
 * Uploads a bundled distribution to a target cell.
 */
export type WebpackUpload = (args: WebpackUploadArgs) => Promise<WebpackUploadResponse>;
export type WebpackUploadArgs = {
  host: string;
  sourceDir: string;
  targetCell: string | t.ICellUri;
  targetDir?: string;
  silent?: boolean;
};
export type WebpackUploadResponse = {
  ok: boolean;
  bytes: number;
  urls: { cell: string; files: string };
  files: File[];
};

/**
 * Cell compilation target.
 */
export type WebpackCell = (host: string, uri: string | t.ICellUri) => WebpackCellCompiler;
export type WebpackCellCompiler = {
  host: string;
  uri: t.ICellUri;
  dir(config: B): string;
  bundle(config: B, options?: { silent?: boolean }): Promise<WebpackBundleResponse>;
  upload(
    config: B,
    options?: { silent?: boolean; force?: boolean; cleanAfter?: boolean },
  ): Promise<WebpackUploadResponse>;
  clean(config?: B): Promise<void>;
};
