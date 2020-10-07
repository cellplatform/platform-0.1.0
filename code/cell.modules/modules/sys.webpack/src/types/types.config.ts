import { t } from './common';

export type ConfigBuilder = {
  model(): ConfigBuilderModel;
  create(bus: t.EventBus, model?: ConfigBuilderModel): t.BuilderChain<WebpackBuilder>;
};

export type ConfigBuilderModel = t.BuilderModel<t.WebpackModel>;

/**
 * API
 */
export type WebpackBuilder = {
  toObject(): t.WebpackModel;
  mode(value: t.WebpackMode | 'prod' | 'dev'): t.WebpackBuilder;
  port(value: number | undefined): t.WebpackBuilder;
};

/**
 * Data
 */
export type WebpackModel = {
  mode: t.WebpackMode;
  port: number;
};
