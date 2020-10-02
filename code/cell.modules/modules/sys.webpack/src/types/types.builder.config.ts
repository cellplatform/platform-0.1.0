import { t } from './common';

type B = t.EventBus<any>;

/**
 * Factor for creating a [Webpack] configuration builder.
 */
export type WebpackConfigsBuilderFactory = (
  bus: B,
  webpack: t.IModule,
) => t.WebpackConfigsBuilder;

/**
 * Root builder of a Webpack configuration.
 */
export type WebpackConfigsBuilder = {
  name: t.BuilderListByName<WebpackConfigBuilder>;
};

export type WebpackConfigBuilder = {
  name(value: string): WebpackConfigBuilder;
};
