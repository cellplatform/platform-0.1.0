import { webpack } from 'webpack';
import { wp } from '../config.wp';
import { t, toModel, logger } from '../common';

export { logger };

type M = t.CompilerWebpackModel | t.CompilerConfig;

export const toCompiler = (input: M) => {
  const model = toModel(input);
  const config = wp.toWebpackConfig(model);
  const compiler = webpack(config as any);
  return { model, config, compiler };
};
