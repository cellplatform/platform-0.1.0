import { MemoryCache, IMemoryCache } from '@platform/cache';
import { t } from '../common';
import * as jpath from 'jsonpath';

type O = Record<string, unknown>;
type B = t.BuilderChain<any>;
type H = t.BuilderHandlers<any, any>;
type K = t.BuilderMethodKind;

/**
 * A generic (strongly typed) object builder in the form of a chained ("fluent") API.
 */
export function chain<M extends O, A extends O>(args: {
  model: t.BuilderModel<M>;
  handlers: t.BuilderHandlers<M, A>;
  path?: string;
  index?: number;
  parent?: B;
  cache?: IMemoryCache;
  kind?: t.BuilderMethodKind;
}): t.BuilderChain<A> {
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
        chain<any, any>({
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
    .map((key) => ({ key, handler: handlers[key] as t.BuilderHandler<M> }))
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
        builder[key] = (input?: t.BuilderIndexParam) => {
          const path = formatPath(def.path);
          const list = findListOrThrow(model, path);
          const index = deriveIndexFromList(list, input);
          ensureListDefault(model, def, path, index);
          const cacheKey = `${def.kind}/${key}[${index}]`;
          return getOrCreateBuilder(def.kind, cacheKey, path, def.handlers, { index }); // <== RECURSION 🌳
        };
      }

      /**
       * Array list (accessed by "name").
       */
      if (def.kind === 'list:byName') {
        builder[key] = (name: string, index?: t.BuilderIndexParam) => {
          if (typeof name !== 'string' || !name.trim()) {
            throw new Error(`Name of list item not given.`);
          }
          const path = formatPath(def.path);
          const list = findListOrThrow(model, path);
          index = findListIndexByName(list, name, index);
          ensureListDefault(model, def, path, index);
          const cacheKey = `${def.kind}/${key}[${index}]`;
          const builder = getOrCreateBuilder(def.kind, cacheKey, path, def.handlers, { index }); // <== RECURSION 🌳
          if (typeof builder.name !== 'function') {
            throw new Error(`The builder API does not have a "name" method.`);
          }
          return builder.name(name);
        };
      }

      /**
       * Object map (accessed by "key").
       */
      if (def.kind === 'map') {
        builder[key] = (field: string) => {
          if (typeof field !== 'string' || !field.trim()) {
            throw new Error(`The map "key" not given.`);
          }
          const map = jpath.query(model.state, def.path)[0];
          if (!map) {
            throw new Error(`An object (map) does not exist at the path '${def.path}'.`);
          }

          if (!map[field]) {
            model.change((draft) => {
              jpath.apply(draft, def.path, (value) => {
                value[field] = typeof def.default === 'function' ? def.default({ path }) : {};
                return value;
              });
            });
          }

          const cacheKey = `${def.kind}/${key}.${field}]`;
          const path = `${def.path}.${field}`;

          return getOrCreateBuilder(def.kind, cacheKey, path, def.handlers); // <== RECURSION 🌳
        };
      }
    });

  // Finish up.
  return builder as t.BuilderChain<A>;
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

const ensureListDefault = (
  model: t.BuilderModel<any>,
  def: t.BuilderListDef,
  path: string,
  index: number,
) => {
  if (!jpath.query(model.state, `${path}[${index}]`)[0]) {
    model.change((draft: any) => {
      jpath.apply(draft, path, (value) => {
        value[index] = typeof def.default === 'function' ? def.default({ path }) : {};
        return value;
      });
    });
  }
};

const findListOrThrow = (model: t.BuilderModel<any>, path: string) => {
  const list = jpath.query(model.state, path)[0];
  if (!list) {
    throw new Error(`A containing list at path '${path}' does not exist on the model.`);
  }
  if (!Array.isArray(list)) {
    throw new Error(`The value at path '${path}' is a [${typeof list}] rather than an [Array]`);
  }
  return list;
};
