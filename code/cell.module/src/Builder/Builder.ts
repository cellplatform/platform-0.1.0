import { IStateObjectWritable } from '@platform/state.types';
import { MemoryCache, IMemoryCache } from '@platform/cache';
import { t } from '../common';
import * as jsonpath from 'jsonpath';

type O = Record<string, unknown>;
type B = t.Builder<any, any>;
type H = t.BuilderMethods<any, any>;
type K = t.BuilderMethodKind;

/**
 * A generic (strongly typed) object builder in the form of a chained ("fluent") API.
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
    return !is.pathRoot(path) && index !== -1 ? `${args.path}[${index}].${path}` : path;
  };

  const getOrCreateBuilder = (
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

  const findList = (path: string) => {
    path = formatPath(path);
    const list = jsonpath.query(model.state, path)[0];
    if (!list) {
      throw new Error(`A containing list at path '${path}' does not exist on the model.`);
    }
    if (!Array.isArray(list)) {
      throw new Error(`The value at path '${path}' is a [${typeof list}] rather than an [Array]`);
    }
    return { path, list, index };
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
        const cacheKey = `${def.kind}/${key}`;
        Object.defineProperty(builder, key, {
          enumerable: true,
          configurable: false,
          get: () => getOrCreateBuilder(def.kind, cacheKey, path, def.handlers), // <== RECURSION 🌳
        });
      }

      /**
       * Array list (accessed by index).
       */
      if (def.kind === 'list:byIndex') {
        builder[key] = (index?: t.BuilderIndexParam) => {
          const { path, list } = findList(def.path);
          index = deriveIndexFromList(list, index);
          const cacheKey = `${def.kind}/${key}[${index}]`;
          return getOrCreateBuilder(def.kind, cacheKey, path, def.handlers, { index }); // <== RECURSION 🌳
        };
      }

      /**
       * Array list (accessed by name).
       */
      if (def.kind === 'list:byName') {
        builder[key] = (name: string, index?: t.BuilderIndexParam) => {
          if (typeof name !== 'string' || !name.trim()) {
            throw new Error(`Name of list item not given.`);
          }
          const { path, list } = findList(def.path);
          index = findListIndexByName(list, name, index);
          const cacheKey = `${def.kind}/${key}[${index}]`;
          const builder = getOrCreateBuilder(def.kind, cacheKey, path, def.handlers, { index }); // <== RECURSION 🌳
          if (typeof builder.name === 'function') {
            builder.name(name);
          }
          return builder;
        };
      }
    });

  // Finish up.
  return builder as t.Builder<S, M>;
}

/**
 * [Helpers]
 */

const toHandlers = (input: H | (() => H)) => (typeof input === 'function' ? input() : input);

const is = {
  list: (kind: K) => kind.startsWith('list:'),
  map: (kind: K) => kind === 'map',
  object: (item: any) => typeof item === 'object',
  pathRoot: (path: string) => path.startsWith('$'),
};

const deriveIndexFromList = (list: any[], index?: t.BuilderIndexParam) => {
  index = index === undefined ? 'END' : index;
  if (index === 'END') {
    return list.length;
  }
  if (index === 'START') {
    return 0;
  }
  if (typeof index === 'number') {
    return index;
  }
  if (typeof index === 'function') {
    const total = list.length;
    return index({ list, total });
  }
  throw new Error(`Could not derive index for list.`);
};

const findListIndexByName = (list: any[], name: string, index?: t.BuilderIndexParam) => {
  type N = t.BuilderNamedItem;
  const existing = list.findIndex((item: N) => is.object(item) && item?.name === name);
  return existing > -1 ? existing : deriveIndexFromList(list, index);
};
