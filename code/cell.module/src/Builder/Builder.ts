import { IStateObjectWritable } from '@platform/state.types';
import { t } from '../common';

type O = Record<string, unknown>;

// export type

/**
 *
 */
export function Builder<S extends O, M extends O>(args: {
  model: IStateObjectWritable<S>;
  handlers: t.BuilderMethods<S, M>;
  path?: string;
  parent?: t.Builder<any, any>;
}): t.Builder<S, M> {
  const { handlers, model, parent } = args;
  const builder = {};

  // Assign chained method modifiers.
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'function')
    .map((key) => ({ key, handler: handlers[key] as t.BuilderMethod<S> }))
    .forEach(({ key, handler }) => {
      builder[key] = (...params: any[]) => {
        const path = `${args.path || '$'}`;
        const res = handler({ path, key, params, model, parent });
        return res || builder;
      };
    });

  // Assign "step-in" child builder properties.
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'object')
    .map((key) => ({ key, def: handlers[key] as t.BuilderChild }))
    .forEach(({ key, def }) => {
      let child: t.Builder<any, any>;

      Object.defineProperty(builder, key, {
        enumerable: true,
        configurable: false,
        get() {
          if (!child) {
            if (def.type === 'CHILD/Object') {
              const path = def.path;
              const handlers = typeof def.handlers === 'function' ? def.handlers() : def.handlers;
              child = Builder<any, any>({ path, model, parent: builder, handlers });
            } else {
              throw new Error(`Child builder type '${def.type}' not supported.`);
            }
          }

          return child;
        },
      });
    });

  // Finish up.
  return builder as t.Builder<S, M>;
}
