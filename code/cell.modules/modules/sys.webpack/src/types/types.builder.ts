import { t } from './common';

type B = t.EventBus<any>;

/**
 * Index of builders
 */
export type WebpackBuilders = {
  // config: t.WebpackConfigsBuilderFactory;
};

/**
 * Factor for creating a [Webpack] configuration builder.
 */
export type WebpackConfigsBuilderFactory = (bus: B, webpack: t.IModule) => t.WebpackConfigsBuilder;

/**
 * Root builder of a set of Webpack configurations.
 */
export type WebpackConfigsBuilder = {
  toObject(): t._WebpackConfigs;
  name: t.BuilderMap<t._WebpackConfigBuilder, string, { initial?: t._WebpackConfigData }>;
};
