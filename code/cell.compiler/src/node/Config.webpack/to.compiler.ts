import { Configuration, webpack } from 'webpack';

import { t, toModel } from '../common';
import { wp } from '../Config.webpack';

type M = t.CompilerModel | t.CompilerModelBuilder;

/**
 * Converts a configuration state into a live Webpack compiler.
 */
export const toCompiler = (
  input: M,
  options: { name?: string; beforeCompile?: t.BeforeCompile } = {},
) => {
  const { beforeCompile } = options;
  const name = (options.name || '').trim();
  const model = toModel(input, { name });
  const config = wp.toWebpackConfig(model, { beforeCompile });
  const compiler = webpack(config as Configuration);
  return { model, config, compiler };
};
