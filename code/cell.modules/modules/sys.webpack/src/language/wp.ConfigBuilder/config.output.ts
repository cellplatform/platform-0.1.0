import { Builder, t } from '../../common';

const format = Builder.format;
const formatPath = (input: any) => format.string(input, { trim: true });

type M = t.WebpackConfigData;

/**
 * https://webpack.js.org/concepts/output/
 */
export function outputHandlers() {
  const handlers: t.BuilderHandlers<M, t.WebpackConfigBuilderOutput> = {
    parent: (args) => args.builder.parent,

    filename(args) {
      args.model.change((draft) => {
        model(draft).output.filename = formatPath(args.params[0]);
      });
    },

    path(args) {
      args.model.change((draft) => {
        model(draft).output.path = formatPath(args.params[0]);
      });
    },

    publicPath(args) {
      args.model.change((draft) => {
        model(draft).output.publicPath = formatPath(args.params[0]);
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
    get output() {
      return model.output || (model.output = {});
    },
  };
};
