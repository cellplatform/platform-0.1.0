import { t } from './common';

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
