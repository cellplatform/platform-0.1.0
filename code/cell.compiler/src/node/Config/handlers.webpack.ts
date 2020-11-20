import { R, DEFAULT, t } from '../common';

/**
 * Handlers for direct "Webpack" (library) concepts.
 */
export const webpackMethods = (model: t.BuilderModel<t.CompilerModel>) => {
  const res: t.CompilerModelMethodsWebpack = {
    rule(value) {
      model.change((draft) => Model(draft).webpack.rules.push(value));
      return res;
    },
    plugin(value) {
      model.change((draft) => Model(draft).webpack.plugins.push(value));
      return res;
    },
  };
  return res;
};

/**
 * [Helpers]
 */

const Model = (model: t.CompilerModel) => {
  return {
    toObject: () => model,
    get webpack() {
      return model.webpack || (model.webpack = R.clone(DEFAULT.WEBPACK));
    },
  };
};
