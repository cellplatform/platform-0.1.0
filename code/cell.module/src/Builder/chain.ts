import { MemoryCache, IMemoryCache } from '@platform/cache';
import { t, jpath } from '../common';

type O = Record<string, unknown>;
type B = t.BuilderChain<any>;
type K = t.BuilderMethodKind;

/**
 * A generic (strongly typed) object builder in the form of a chained ("fluent") API.
 * Types:
 *    <M> Model
 *    <A> API
 */
export function chain<M extends O, A extends O>(args: {
  handlers: t.BuilderHandlers<M, A>;
  model: t.BuilderModel<M>;

  // [Internal]
  parent?: B;
  path?: string;
  index?: number;
  cache?: IMemoryCache;
  kind?: t.BuilderMethodKind;
}): t.BuilderChain<A> {
  const { handlers, parent, kind = 'ROOT', model } = args;
  const index = args.index === undefined || args.index < 0 ? -1 : args.index;
  const cache = args.cache || MemoryCache.create();
  const builder = {};

  const formatPath = (path?: string) => {
    if (path === undefined) {
      return '';
    } else {
      path = path.trim();
      return !is.pathRoot(path) && index !== -1 ? `${args.path}[${index}].${path}` : path;
    }
  };

  const getOrCreate = (cacheKey: string, create: () => B) => {
    if (cache.exists(cacheKey)) {
      return cache.get(cacheKey);
    } else {
      const builder = create();
      cache.put(cacheKey, builder);
      return builder;
    }
  };

  // Assign chained method modifiers.
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'function')
    .map((key) => ({ key, handler: handlers[key] as t.BuilderHandler<M> }))
    .forEach(({ key, handler }) => {
      builder[key] = (...params: any[]) => {
        const handlerArgs: t.BuilderHandlerArgs<M> = {
          kind,
          key,
          index,
          params,
          parent,
          path: args.path === undefined ? '$' : `${args.path || '$'}`,
          model,
          is: { list: is.list(kind), map: is.map(kind) },
        };
        const res = handler(handlerArgs);
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
        Object.defineProperty(builder, key, {
          enumerable: true,
          configurable: false,
          get() {
            const path = formatPath(def.path);
            const cacheKey = `${def.kind}:${path}:${key}`;
            const parent = builder;
            return getOrCreate(cacheKey, () => {
              ensureObjectAt(model, path, def.default);
              return fromFactory({ model, parent }).map('object', def.builder, key, path); // <== RECURSION 🌳
            });
          },
        });
      }

      /**
       * Array list (accessed by index).
       */
      if (def.kind === 'list:byIndex') {
        builder[key] = (input?: t.BuilderIndexParam) => {
          const path = formatPath(def.path);
          const list = findListOrThrow(model, path);
          const index = deriveListIndex(list, input);
          const cacheKey = `${def.kind}:${path}:${key}[${index}]`;

          ensureDefaultAtIndex(model, path, index, def.default);

          return getOrCreate(cacheKey, () => {
            const parent = builder;
            return fromFactory({ model, parent }).list('list:byIndex', def.builder, index, path); // <== RECURSION 🌳
          });
        };
      }

      /**
       * Array list (accessed by "name").
       */
      if (def.kind === 'list:byName') {
        builder[key] = (name: string, i?: t.BuilderIndexParam) => {
          if (typeof name !== 'string' || !name.trim()) {
            throw new Error(`Name of list item not given.`);
          }

          const path = formatPath(def.path);
          const list = findListOrThrow(model, path);
          const index = findListIndexByName(list, name, i);
          const cacheKey = `${def.kind}:${path}:${key}[${index}]`;

          ensureDefaultAtIndex(model, path, index, def.default);

          const builder = getOrCreate(cacheKey, () => {
            const parent = builder;
            return fromFactory({ model, parent }).list('list:byName', def.builder, index, path); // <== RECURSION 🌳
          });

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
          const path = formatPath(def.path);
          const cacheKey = `${def.kind}:${path}:${key}.${field}]`;
          const parent = builder;

          return getOrCreate(cacheKey, () => {
            const fieldPath = path ? `${path}.${field}` : '';
            if (fieldPath) {
              ensureObjectAt(model, parentPath(path).parent);
              ensureObjectAt(model, path);
              ensureObjectAt(model, fieldPath, def.default);
            }
            return fromFactory({ model, parent }).map('map', def.builder, field, fieldPath); // <== RECURSION 🌳
          });
        };
      }
    });

  // Finish up.
  return builder as t.BuilderChain<A>;
}

/**
 * [Helpers]
 */

const is = {
  list: (kind: K) => kind.startsWith('list:'),
  map: (kind: K) => kind === 'map',
  object: (item: any) => typeof item === 'object',
  pathRoot: (path: string) => path.startsWith('$'),
};

const parentPath = (path: string) => {
  const parts = path.split('.');
  const parent = parts.slice(0, parts.length - 1).join('.');
  const field = parts[parts.length - 1];
  return { path, parent, field };
};

const ensureObjectAt = (
  model: t.BuilderModel<any>,
  path: string,
  defaultObject?: () => O | O[],
) => {
  if (path) {
    const get = () => jpath.query(model.state, path)[0];
    if (!get()) {
      const { parent, field } = parentPath(path);
      model.change((draft) => {
        const obj = typeof defaultObject === 'function' ? defaultObject() : {};
        if (parent === '$') {
          draft[field] = obj;
        } else {
          jpath.apply(draft, parent, (value) => {
            value[field] = obj;
            return value;
          });
        }
      });
    }
    return get();
  }
};

const deriveListIndex = (list: any[], index?: t.BuilderIndexParam) => {
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
  return existing > -1 ? existing : deriveListIndex(list, index);
};

const ensureDefaultAtIndex = (
  model: t.BuilderModel<any>,
  path: string,
  index: number,
  defaultValue?: () => O,
) => {
  if (!jpath.query(model.state, `${path}[${index}]`)[0]) {
    model.change((draft: any) => {
      jpath.apply(draft, path, (value) => {
        value[index] = typeof defaultValue === 'function' ? defaultValue() : {};
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

const fromFactory = (args: { model: t.BuilderModel<any>; parent: t.BuilderChain<any> }) => {
  const { parent } = args;
  return {
    /**
     * Create [list] builder from factory.
     */
    list(
      kind: t.BuilderMethodKindList,
      factory: t.BuilderListFactory<any, any>,
      index: number,
      path: string,
    ) {
      return factory({
        index,
        path,
        model: args.model,
        create<M extends O, A extends O>(
          handlers: t.BuilderHandlers<M, A>,
          model?: t.BuilderModel<M>,
        ) {
          model = model || args.model;
          return chain<M, A>({ kind, parent, model, handlers, path, index });
        },
      });
    },

    /**
     * Create {object} builder from factory.
     */
    map(
      kind: t.BuilderMethodKindObject,
      factory: t.BuilderMapFactory<any, any>,
      key: string,
      path: string,
    ) {
      return factory({
        key,
        path,
        model: args.model,
        create<M extends O, A extends O>(
          handlers: t.BuilderHandlers<M, A>,
          model?: t.BuilderModel<M>,
        ) {
          model = model || args.model;
          return chain<M, A>({ kind, parent, model, handlers, path });
        },
      });
    },
  };
};
