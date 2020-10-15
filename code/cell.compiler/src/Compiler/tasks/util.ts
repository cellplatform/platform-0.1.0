import { Configuration, webpack } from 'webpack';

import { t, toModel } from '../common';
import { wp } from '../config.wp';

export * from './util.logger';

type M = t.CompilerWebpackModel | t.CompilerConfig;

export const toCompiler = (
  input: M,
  options: { modifyConfig?: (config: t.WpConfig) => t.WpConfig } = {},
) => {
  const model = toModel(input);
  let config = wp.toWebpackConfig(model);

  if (options.modifyConfig) {
    config = options.modifyConfig(config);
  }

  const compiler = webpack(config as Configuration);
  return { model, config, compiler };
};
