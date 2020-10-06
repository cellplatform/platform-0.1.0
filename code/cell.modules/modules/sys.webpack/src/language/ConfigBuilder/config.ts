import { Builder, DEFAULT, t } from '../../common';

const MODES: t.WebpackMode[] = ['development', 'production'];
const format = Builder.format;
const formatName = (input: any) => format.string(input, { trim: true }) || '';

type M = t.ITreeNode<t.WebpackProps>;
type C = t.WebpackConfigData;

/**
 * A single configuration
 */
export function configHandlers(bus: t.EventBus) {
  const handlers: t.BuilderHandlers<C, t.WebpackConfigBuilder> = {
    toObject: (args) => args.model.state,

    clone(args) {
      const name = formatName(args.params[0]);
      const parent = args.builder.parent as t.BuilderChain<t.WebpackConfigsBuilder>;
      if (parent.toObject()[name]) {
        throw new Error(`Cannot clone. The config name '${name}' is already in use.`);
      } else {
        return parent.name(name, { initial: args.model.state });
      }
    },

    name(args) {
      args.model.change((draft) => {
        const name = formatName(args.params[0]);
        draft.name = name;
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

    devtool(args) {
      args.model.change((draft) => {
        let value = args.params[0];
        value = value === false ? undefined : value;
        value = typeof value === 'string' ? format.string(value, { trim: true }) : value;
        draft.devTool = value;
      });
    },
  };
  return handlers;
}
