import { t, Builder, jpath, StateObject } from '../common';

const format = Builder.format;

/**
 * Factor for creating a [Webpack] configuration builder.
 */
export const factory: t.WebpackConfigsBuilderFactory = (bus, model) => {
  type M = t.ITreeNode<t.WebpackProps>;
  const handlers: t.BuilderHandlers<M, t.WebpackConfigsBuilder> = {
    name: {
      kind: 'list:byName',
      path: '$.props.data.configs',
      default: () => ({}),
      builder(args) {
        console.log('path', args.path, args.index);

        // StateObject.merge()

        const handlers = configHandlers(bus);
        return args.create<M, t.WebpackConfigBuilder>(handlers); //.name(args.name);
      },
    },
  };

  return Builder.create<M, t.WebpackConfigsBuilder>({ model, handlers });
};

/**
 * A single configuration
 */
function configHandlers(bus: t.EventBus) {
  const handlers: t.BuilderHandlers<M, t.WebpackConfigBuilder> = {
    name(args) {
      args.model.change((draft) => {
        const path = `${args.path}[${args.index}]`;
        jpath.apply(draft, path, (value: t.WebpackDataConfig) => {
          value.name = format.string(args.params[0], { trim: true });
          return value;
        });
      });
    },
  };
  return handlers;
}
