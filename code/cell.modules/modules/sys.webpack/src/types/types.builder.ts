import { t } from './common';

type B = t.EventBus<any>;

/**
 * Index of builders
 */
export type WebpackBuilders = {
  // config: t.WebpackConfigsBuilderFactory;
  config: t.ConfigBuilder;
};
