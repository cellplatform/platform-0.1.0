import { t } from './common';

type M = t.WebpackModel | t.ConfigBuilderChain;

export type WebpackCompiler = {
  bundle: WebpackBundle;
  watch: WebpackWatch;
  dev: WebpackDev;
  // pipe(client|host, sourceDir, targetUri): Promise
  // or upload
};

export type WebpackWatch = (input: M) => Promise<void>;

export type WebpackBundle = (input: M) => Promise<WebpackBundleResponse>;
export type WebpackBundleResponse = {
  ok: boolean;
  elapsed: number;
  stats: t.WebpackStats;
  model: t.WebpackModel;
  config: t.WebpackConfig;
  toString(): string;
  // pipe(client|host, targetUri): Promise
};

export type WebpackDev = (input: M) => Promise<void>;
