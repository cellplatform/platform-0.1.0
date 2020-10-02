import { Builder, t } from '../../common';

const format = Builder.format;

type M = t.ITreeNode<t.WebpackProps>;
type C = t.WebpackDataConfig;

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
  };
  return handlers;
}
