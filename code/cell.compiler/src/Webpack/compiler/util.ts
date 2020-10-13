import { webpack } from 'webpack';
import { wp } from '../config.wp';
import { t } from '../common';

export * from './util.logger';

type M = t.WebpackModel | t.ConfigBuilderChain;

export const toCompiler = (input: M) => {
  const model = wp.toModel(input);
  const config = wp.toWebpackConfig(model);
  const compiler = webpack(config as any);
  return { model, config, compiler };
};
