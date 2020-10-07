import { Builder, t } from '../../common';

const format = Builder.format;

type M = t._WebpackConfigData;

/**
 * https://webpack.js.org/configuration/resolve/
 */
export function resolveHandlers() {
  const handlers: t.BuilderHandlers<M, t._WebpackConfigBuilderResolve> = {
    parent: (args) => args.builder.parent,

    extensions(args) {
      args.model.change((draft) => {
        const value = ((args.params[0] || []) as string[])
          .map((ext) => format.string(ext, { trim: true }) as string)
          .filter((ext) => ext !== undefined)
          .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));
        model(draft).resolve.extensions = value.length > 0 ? value : undefined;
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
    get resolve() {
      return model.resolve || (model.resolve = {});
    },
  };
};
