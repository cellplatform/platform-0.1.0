import { Builder, t, DEFAULT } from '../../common';

const format = Builder.format;
const MODES: t.WebpackMode[] = ['development', 'production'];

type M = t.ITreeNode<t.WebpackProps>;
type C = t.WebpackConfigData;

/**
 * A single configuration
 */
export function configHandlers(bus: t.EventBus) {
  const handlers: t.BuilderHandlers<C, t.WebpackConfigBuilder> = {
    name(args) {
      args.model.change((draft) => {
        draft.name = format.string(args.params[0], { trim: true }) || '';
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
  };
  return handlers;
}
