import { IStateObjectWritable } from '@platform/state.types';
import { t } from '../common';
import * as jsonpath from 'jsonpath';

type O = Record<string, unknown>;
type B = t.Builder<any, any>;
type H = t.BuilderMethods<any, any>;

const toHandlers = (input: H | (() => H)) => (typeof input === 'function' ? input() : input);

/**
 * A strongly typed object builder.
 */
export function Builder<S extends O, M extends O>(args: {
  model: IStateObjectWritable<S>;
  handlers: t.BuilderMethods<S, M>;
  path?: string;
  index?: number;
  parent?: t.Builder<any, any>;
}): t.Builder<S, M> {
  const { handlers, model, parent } = args;
  const index = args.index === undefined || args.index < 0 ? -1 : args.index;
  const builder = {};

  const childBuilders: { [key: string]: B } = {};
  const getOrCreateChildBuilder = (
    cacheKey: string,
    path: string,
    handlers: H | (() => H),
    options: { index?: number } = {},
  ): B => {
    if (!childBuilders[cacheKey]) {
      childBuilders[cacheKey] = Builder<any, any>({
        path,
        model,
        parent: builder,
        handlers: toHandlers(handlers),
        index: options.index,
      });
    }
    return childBuilders[cacheKey];
  };

  // Assign chained method modifiers.
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'function')
    .map((key) => ({ key, handler: handlers[key] as t.BuilderMethod<S> }))
    .forEach(({ key, handler }) => {
      builder[key] = (...params: any[]) => {
        const path = `${args.path || '$'}`;
        const res = handler({ path, key, index, params, model, parent });
        return res || builder;
      };
    });

  // Assign child builder fields.
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'object')
    .map((key) => ({ key, def: handlers[key] as t.BuilderChild }))
    .forEach(({ key, def }) => {
      /**
       * Simple child object.
       */
      if (def.type === 'CHILD/object') {
        const cacheKey = `object/${key}`;
        Object.defineProperty(builder, key, {
          enumerable: true,
          configurable: false,
          get: () => getOrCreateChildBuilder(cacheKey, def.path, def.handlers),
        });
      }

      /**
       * Array list (accessed by index).
       */
      if (def.type === 'CHILD/list/byIndex') {
        builder[key] = (index?: number) => {
          const list = jsonpath.query(model.state, def.path)[0];
          if (!list) {
            throw new Error(`A containing list at path '${def.path}' does not exist on the model.`);
          }
          index = Math.max(0, index === undefined ? list.length : (index as number));
          const cacheKey = `list/${key}[${index}]`;
          return getOrCreateChildBuilder(cacheKey, def.path, def.handlers, { index });
        };
      }
    });

  // Finish up.
  return builder as t.Builder<S, M>;
}
