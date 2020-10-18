import { DEFAULT, t } from '../common';

/**
 * Handlers for direct Webpack concepts.
 */
export const webpackHandlers: t.BuilderHandlers<t.CompilerModel, t.CompilerModelWebpackMethods> = {
  parent: (args) => args.builder.parent,

  rule(args) {
    const rule = args.params[0];
    args.model.change((draft) => model(draft).webpack.rules.push(rule));
  },

  plugin(args) {
    const plugin = args.params[0];
    args.model.change((draft) => model(draft).webpack.plugins.push(plugin));
  },
};

/**
 * [Helpers]
 */

const model = (model: t.CompilerModel) => {
  return {
    toObject: () => model,
    get webpack() {
      return model.webpack || (model.webpack = DEFAULT.WEBPACK);
    },
  };
};
