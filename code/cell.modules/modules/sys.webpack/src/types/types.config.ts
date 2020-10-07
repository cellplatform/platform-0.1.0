import { t } from './common';

type B = t.BuilderChain<WebpackBuilder>;

export type ConfigBuilder = {
  model(): ConfigBuilderModel;
  create(model?: ConfigBuilderModel): ConfigBuilderChain;
};

export type ConfigBuilderChain = t.BuilderChain<WebpackBuilder>;
export type ConfigBuilderModel = t.BuilderModel<t.WebpackModel>;

/**
 * API
 */
export type WebpackBuilder = {
  toObject(): t.WebpackModel;
  mode(value: t.WebpackMode | 'prod' | 'dev'): B;
  port(value: number | undefined): B;
};

/**
 * Data
 */
export type WebpackModel = {
  mode: t.WebpackMode;
  port: number;
};
