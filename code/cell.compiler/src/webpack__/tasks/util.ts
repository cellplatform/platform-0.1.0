import { webpack, Configuration } from 'webpack';
import { wp } from '../config.wp';
import { t, toModel, logger } from '../common';

export { logger };

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
