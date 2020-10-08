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
  clone(): B;

  name(value: string): B;
  title(value: string | undefined): B;
  mode(value: t.WebpackMode | 'prod' | 'dev'): B;
  port(value: number | undefined): B;
  lint(value: boolean | undefined): B;
  entry(key: string, value: string | null): B;
};

/**
 * Data
 */
export type WebpackModel = {
  name: string;
  title?: string;
  mode: t.WebpackMode;
  port: number;
  lint?: boolean;
  entry?: Record<string, string>;
};
