import { Configuration, webpack } from 'webpack';
import produce from 'immer';

import { t, toModel } from '../common';
import { wp } from '../Config.webpack';

type M = t.CompilerWebpackModel | t.CompilerConfig;

/**
 * Converts a configuration state into a live Webpack compiler.
 */
export const toCompiler = (input: M, options: { beforeCompile?: t.BeforeCompile } = {}) => {
  const model = toModel(input);
  let config = wp.toWebpackConfig(model);

  const before = [...(model.beforeCompile || [])];
  if (options.beforeCompile) {
    before.unshift(options.beforeCompile);
  }

  if (before.length > 0) {
    const e: t.BeforeCompileArgs = {
      model,
      modify(fn: (draft: t.WpConfig) => void) {
        config = produce(config, (draft) => {
          fn(draft);
          return undefined; // NB: Do not consider the return value as a change (immer).
        });
      },
    };
    before.forEach((fn) => fn(e));
  }

  const compiler = webpack(config as Configuration);
  return { model, config, compiler };
};
