import { Builder, jpath, StateObject, t } from '../../common';
import { configHandlers } from './handlers.config';

type M = t.ITreeNode<t.WebpackProps>;
type C = t.WebpackDataConfig;

/**
 * Factory for creating a [Webpack] configuration builder.
 */
export const factory: t.WebpackConfigsBuilderFactory = (bus, model) => {
  const handlers: t.BuilderHandlers<M, t.WebpackConfigsBuilder> = {
    name: {
      kind: 'list:byName',
      path: '$.props.data.configs',
      default: () => ({ name: '' }),
      builder(args) {
        /**
         *
         * TODO 🐷
         *    - Put this "child syncer" somewhere sensible.
         *    - Handle [dispose$] on child model (add [dispose] concept to builder, pass through args)
         *
         */

        const path = `${args.path}[${args.index}]`;
        const initial = jpath.query(args.model.state, path)[0];
        const model = StateObject.create<C>(initial);

        model.event.changed$.pipe().subscribe((e) => {
          args.model.change((draft) => {
            jpath.apply(draft, args.path, (list: any[]) => {
              list[args.index] = e.to;
              return list;
            });
          });
        });

        const handlers = configHandlers(bus);
        return args.create<C, t.WebpackConfigBuilder>(handlers, model);
      },
    },
  };

  return Builder.create<M, t.WebpackConfigsBuilder>({ model, handlers });
};
