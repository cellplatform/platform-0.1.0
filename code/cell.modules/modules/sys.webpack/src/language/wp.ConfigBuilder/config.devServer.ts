import { Builder, t } from '../../common';

const format = Builder.format;

type M = t.WebpackConfigData;

/**
 * https://webpack.js.org/configuration/dev-server/
 */
export function devServerHandlers() {
  const handlers: t.BuilderHandlers<M, t.WebpackConfigBuilderDevServer> = {
    parent: (args) => args.builder.parent,

    port(args) {
      args.model.change((draft) => {
        model(draft).devServer.port = format.number(args.params[0]);
      });
    },
  };
  return handlers;
}

/**
 * Helpers
 */

const model = (model: M) => {
  return {
    get devServer() {
      return model.devServer || (model.devServer = {});
    },
  };
};
