import { takeUntil } from 'rxjs/operators';

import { Builder, jpath, StateObject, t } from '../../common';
import { configHandlers } from './config';
import { DEFAULT } from './DEFAULT';

type M = t.ITreeNode<t.WebpackProps>;
type C = t._WebpackConfigData;

/**
 * Factory for creating a [Webpack] configuration builder.
 */
export const factory: t.WebpackConfigsBuilderFactory = (bus, model) => {
  const handlers: t.BuilderHandlers<M, t.WebpackConfigsBuilder> = {
    toObject: (args) => {
      const data = args.model.state.props?.data || DEFAULT.DATA;
      return data.configs;
    },

    name: {
      kind: 'map',
      path: '$.props.data.configs',
      default: () => DEFAULT.CONFIG,
      builder(args) {
        const parent = args.model;
        const initial = jpath.query(parent.state, args.path)[0] as C;
        const child = StateObject.create<C>(initial);

        // NB: Changes on the child builder model are propogated up into the parent.
        child.event.changed$.pipe(takeUntil(args.builder.dispose$)).subscribe((e) => {
          parent.change((draft) => jpath.apply(draft, args.path, () => e.to));
        });

        const handlers = configHandlers();
        return args.create<C, t._WebpackConfigBuilder>(handlers, child).name(args.key);
      },
    },
  };

  return Builder.create<M, t.WebpackConfigsBuilder>({ model, handlers });
};
