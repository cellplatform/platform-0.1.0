import { Builder, t } from '../../common';
import { outputHandlers } from './config.output';
import { resolveHandlers } from './config.resolve';
import { devServerHandlers } from './config.devServer';
import { DEFAULT } from './DEFAULT';

const MODES: t.WebpackMode[] = ['development', 'production'];
const format = Builder.format;
const formatName = (input: any) => format.string(input, { trim: true }) || '';

// type M = t.ITreeNode<t.WebpackProps>;
type C = t._WebpackConfigData;

/**
 * A single configuration
 */
export function configHandlers() {
  const handlers: t.BuilderHandlers<C, t._WebpackConfigBuilder> = {
    parent: (args) => args.builder.parent,
    toObject: (args) => args.model.state,

    clone(args) {
      const value = formatName(args.params[0]);
      const parent = args.builder.parent as t.BuilderChain<t.WebpackConfigsBuilder>;
      if (parent.toObject()[value]) {
        throw new Error(`Cannot clone. The config name '${value}' is already in use.`);
      } else {
        return parent.name(value, { initial: args.model.state });
      }
    },

    name(args) {
      args.model.change((draft) => {
        const value = formatName(args.params[0]);
        draft.name = value;
      });
    },

    context(args) {
      args.model.change((draft) => {
        const value = format.string(args.params[0], { trim: true });
        draft.context = value;
      });
    },

    mode(args) {
      args.model.change((draft) => {
        const defaultMode = DEFAULT.CONFIG.mode;
        let value = format.string(args.params[0], {
          trim: true,
          default: defaultMode,
        }) as t.WebpackMode;

        value = (value as string) === 'prod' ? 'production' : value;
        value = (value as string) === 'dev' ? 'development' : value;

        if (!MODES.includes(value)) {
          throw new Error(`Invalid mode ("production" or "development")`);
        }

        draft.mode = value;
      });
    },

    devTool(args) {
      args.model.change((draft) => {
        let value = args.params[0];
        value = value === false ? undefined : value;
        value = typeof value === 'string' ? format.string(value, { trim: true }) : value;
        draft.devTool = value;
      });
    },

    output: {
      kind: 'object',
      path: '$.output',
      builder: (args) => args.create<C, t._WebpackConfigBuilderOutput>(outputHandlers()),
    },

    resolve: {
      kind: 'object',
      path: '$.resolve',
      builder: (args) => args.create<C, t._WebpackConfigBuilderResolve>(resolveHandlers()),
    },

    devServer: {
      kind: 'object',
      path: '$.devServer',
      builder: (args) => args.create<C, t._WebpackConfigBuilderDevServer>(devServerHandlers()),
    },
  };
  return handlers;
}
