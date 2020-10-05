import { takeUntil } from 'rxjs/operators';

import { Builder, jpath, StateObject, t, constants } from '../../common';
import { configHandlers } from './handlers.config';

type M = t.ITreeNode<t.WebpackProps>;
type C = t.WebpackConfigData;

/**
 * Factory for creating a [Webpack] configuration builder.
 */
export const factory: t.WebpackConfigsBuilderFactory = (bus, model) => {
  const handlers: t.BuilderHandlers<M, t.WebpackConfigsBuilder> = {
    name: {
      kind: 'list:byName',
      path: '$.props.data.configs',
      default: () => constants.DEFAULT.CONFIG,
      builder(args) {
        const parent = args.model;
        const initial = jpath.query(parent.state, `${args.path}[${args.index}]`)[0];
        const child = StateObject.create<C>(initial);

        child.event.changed$.pipe(takeUntil(args.builder.dispose$)).subscribe((e) => {
          parent.change((draft) => {
            jpath.apply(draft, args.path, (list: any[]) => {
              list[args.index] = e.to;
              return list;
            });
          });
        });

        const handlers = configHandlers(bus);
        return args.create<C, t.WebpackConfigBuilder>(handlers, child);
      },
    },
  };

  return Builder.create<M, t.WebpackConfigsBuilder>({ model, handlers });
};
