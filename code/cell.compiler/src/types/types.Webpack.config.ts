import { t } from './common';

type B = t.BuilderChain<WebpackBuilder>;

export type ConfigBuilder = {
  model(name: string): ConfigBuilderModel;
  create(input: string | ConfigBuilderModel): ConfigBuilderChain;
};

export type ConfigBuilderChain = t.BuilderChain<WebpackBuilder>;
export type ConfigBuilderModel = t.BuilderModel<t.WebpackModel>;

/**
 * API
 */
export type WebpackBuilder = {
  toObject(): t.WebpackModel;
  toWebpack(): t.WpConfig;
  clone(): B;

  name(value: string): B;
  title(value: string | undefined): B;
  mode(value: t.WpMode | 'prod' | 'dev'): B;
  port(value: number | undefined): B;
  host(value: string | undefined): B;
  target(value: t.WpTarget | undefined): B;
  lint(value: boolean | undefined): B;
  entry(path: string): B;
  entry(key: string, path?: string | null): B;
  expose(key: string, path: string | null): B;
  remote(key: string, path: string | null): B;
  shared(fn: WebpackBuilderSharedFunc): B;
};

export type WebpackBuilderSharedFunc = (fn: WebpackBuilderShared) => any;
export type WebpackBuilderShared = {
  cwd: string;
  deps: Record<string, string>;
  add(deps: Record<string, string>): WebpackBuilderShared;
  add(name: string | string[]): WebpackBuilderShared;
  singleton(name: string | string[]): WebpackBuilderShared;
};

/**
 * Data
 */
export type WebpackModel = {
  name: string;
  title?: string;
  mode: t.WpMode;
  port: number;
  host?: string;
  target?: t.WpTarget;
  lint?: boolean;
  entry?: Record<string, string>;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, string | WebpackShared>;
};

export type WebpackShared = { singleton: boolean; requiredVersion: string };
