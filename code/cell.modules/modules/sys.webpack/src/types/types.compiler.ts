import { t } from './common';
import { Stats } from 'webpack';

type M = t.WebpackModel | t.ConfigBuilderChain;

export type WebpackCompiler = {
  bundle: WebpackBundle;
  watch: WebpackWatch;
  dev: WebpackDev;
};

export type WebpackWatch = (input: M) => Promise<void>;

export type WebpackBundle = (input: M) => Promise<WebpackBundleResponse>;
export type WebpackBundleResponse = {
  ok: boolean;
  elapsed: number;
  stats: Stats;
  toString(): string;
  model: t.WebpackModel;
};

export type WebpackDev = (input: M) => Promise<void>;
