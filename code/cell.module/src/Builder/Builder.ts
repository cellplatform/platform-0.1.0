import { IStateObjectWritable } from '@platform/state.types';
import { MemoryCache, IMemoryCache } from '@platform/cache';
import { t } from '../common';
import * as jsonpath from 'jsonpath';

type O = Record<string, unknown>;
type B = t.Builder<any, any>;
type H = t.BuilderMethods<any, any>;
type K = t.BuilderMethodKind;

const toHandlers = (input: H | (() => H)) => (typeof input === 'function' ? input() : input);
const isPathRoot = (path: string) => path.startsWith('$');
const is = {
  list: (kind: K) => kind.startsWith('list:'),
  map: (kind: K) => kind === 'map',
};

/**
 * A strongly typed object builder.
 */
export function Builder<S extends O, M extends O>(args: {
  model: IStateObjectWritable<S>;
  handlers: t.BuilderMethods<S, M>;
  path?: string;
  index?: number;
  parent?: t.Builder<any, any>;
  cache?: IMemoryCache;
  kind?: t.BuilderMethodKind;
}): t.Builder<S, M> {
  const { handlers, model, parent, kind = 'ROOT' } = args;
  const index = args.index === undefined || args.index < 0 ? -1 : args.index;
  const cache = args.cache || MemoryCache.create();
  const builder = {};

  const formatPath = (path: string) => {
    return !isPathRoot(path) && index !== -1 ? `${args.path}[${index}].${path}` : path;
  };

  const getOrCreateChildBuilder = (
    kind: t.BuilderChild['kind'],
    cacheKey: string,
    path: string,
    handlers: H | (() => H),
    options: { index?: number } = {},
  ): B => {
    cacheKey = `${cacheKey}:${path}`;
    if (!cache.exists(cacheKey)) {
      cache.put(
        cacheKey,
        Builder<any, any>({
          kind,
          model,
          path: formatPath(path),
          parent: builder,
          handlers: toHandlers(handlers),
          index: options.index,
          cache,
        }),
      );
    }
    return cache.get<B>(cacheKey);
  };

  // Assign chained method modifiers.
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'function')
    .map((key) => ({ key, handler: handlers[key] as t.BuilderMethod<S> }))
    .forEach(({ key, handler }) => {
      builder[key] = (...params: any[]) => {
        const path = `${args.path || '$'}`;
        const isList = is.list(kind);
        const isMap = is.list(kind);
        const res = handler({ kind, path, key, index, params, model, parent, isList, isMap });
        return res || builder;
      };
    });

  /**
   * Child Builders.
   */
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'object')
    .map((key) => ({ key, def: handlers[key] as t.BuilderChild }))
    .forEach(({ key, def }) => {
      /**
       * Simple child object.
       */
      if (def.kind === 'object') {
        const path = def.path;
        const cacheKey = `OBJECT:${key}`;
        Object.defineProperty(builder, key, {
          enumerable: true,
          configurable: false,
          get: () => getOrCreateChildBuilder(def.kind, cacheKey, path, def.handlers), // <== RECURSION 🌳
        });
      }

      /**
       * Array list (accessed by index).
       */
      if (def.kind === 'list:byIndex') {
        builder[key] = (index?: number) => {
          const path = formatPath(def.path);
          const list = jsonpath.query(model.state, path)[0];
          if (!list) {
            throw new Error(`A containing list at path '${def.path}' does not exist on the model.`);
          }
          index = Math.max(0, index === undefined ? list.length : (index as number));
          const cacheKey = `LIST:${key}[${index}]`;

          return getOrCreateChildBuilder(def.kind, cacheKey, path, def.handlers, { index }); // <== RECURSION 🌳
        };
      }
    });

  // Finish up.
  return builder as t.Builder<S, M>;
}
