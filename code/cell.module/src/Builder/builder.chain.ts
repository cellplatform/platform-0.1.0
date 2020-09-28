import { MemoryCache, IMemoryCache } from '@platform/cache';
import { t } from '../common';
import * as jpath from 'jsonpath';

type O = Record<string, unknown>;
type B = t.BuilderChain<any>;
type K = t.BuilderMethodKind;

/**
 * A generic (strongly typed) object builder in the form of a chained ("fluent") API.
 * Types:
 *    <M> Model
 *    <A> API
 *    <C> Context (optional)
 */
export function chain<M extends O, A extends O, C extends O = O>(args: {
  handlers: t.BuilderHandlers<M, A, C>;
  model: () => t.BuilderModel<M>;
  context?: () => C;
  parent?: B;

  // [Internal]
  path?: string;
  index?: number;
  cache?: IMemoryCache;
  kind?: t.BuilderMethodKind;
}): t.BuilderChain<A> {
  const { handlers, parent, kind = 'ROOT' } = args;
  const index = args.index === undefined || args.index < 0 ? -1 : args.index;
  const cache = args.cache || MemoryCache.create();
  const builder = {};

  const getContext = () => (typeof args.context === 'function' ? args.context() || {} : {}) as C;
  const getModel = () => args.model();

  const formatIndexPath = (path?: string) => {
    if (path === undefined) {
      return '';
    } else {
      return !is.pathRoot(path) && index !== -1 ? `${args.path}[${index}].${path}` : path;
    }
  };

  const fromMapFactory = (
    factory: t.BuilderMapFactory<any, any, any>,
    key: string,
    path: string,
  ) => {
    return factory({
      key,
      model: getModel(),
      parent: builder,
      context: getContext(),
      path,
    });
  };

  const getOrCreateBuilder = (
    kind: t.BuilderChild['kind'],
    cacheKey: string,
    modelPath: string,
    getHandlers: t.BuilderGetHandlers<any, any>,
    options: { index?: number } = {},
  ): B => {
    cacheKey = `${cacheKey}:${modelPath}`;
    if (!cache.exists(cacheKey)) {
      const context = getContext();
      const path = formatIndexPath(modelPath);
      const index = options.index === undefined ? -1 : options.index;
      const handlers = getHandlers({ context, path, index });
      const model = args.model;
      const parent = builder;
      cache.put(
        cacheKey,
        chain<any, any>({ kind, model, path, parent, handlers, index: options.index, cache }), // <== RECURSION 🌳
      );
    }
    return cache.get<B>(cacheKey);
  };

  // Assign chained method modifiers.
  Object.keys(handlers)
    .filter((key) => typeof handlers[key] === 'function')
    .map((key) => ({ key, handler: handlers[key] as t.BuilderHandler<M, C> }))
    .forEach(({ key, handler }) => {
      builder[key] = (...params: any[]) => {
        const handlerArgs: t.BuilderHandlerArgs<M, C> = {
          kind,
          key,
          index,
          params,
          parent,
          context: getContext(),
          path: args.path === undefined ? '$' : `${args.path || '$'}`,
          model: getModel(),
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
        const path = (def.path || '').trim();
        Object.defineProperty(builder, key, {
          enumerable: true,
          configurable: false,
          get() {
            const cacheKey = `${def.kind}:${path}:${key}`;
            if (cache.exists(cacheKey)) {
              return cache.get(cacheKey);
            } else {
              ensureObjectAt(getModel(), path, def.default);
              const builder = fromMapFactory(def.builder, key, path);
              cache.put(cacheKey, builder);
              return builder;
            }
          },
        });
      }

      /**
       * Array list (accessed by index).
       */
      if (def.kind === 'list:byIndex') {
        builder[key] = (input?: t.BuilderIndexParam) => {
          const path = formatIndexPath(def.path);
          const model = getModel();
          const list = findListOrThrow(model, path);
          const index = deriveIndexFromList(list, input);
          ensureListDefault(model, def, path, index);
          const cacheKey = `${def.kind}:${key}[${index}]`;
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
          const model = getModel();
          const path = formatIndexPath(def.path);
          const list = findListOrThrow(model, path);
          index = findListIndexByName(list, name, index);
          ensureListDefault(model, def, path, index);
          const cacheKey = `${def.kind}:${key}[${index}]`;
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
          const path = (def.path || '').trim();
          const cacheKey = `${def.kind}:${path}:${key}.${field}]`;
          if (cache.exists(cacheKey)) {
            return cache.get(cacheKey);
          } else {
            const model = getModel();
            const { parent } = parentPath(path);
            const fieldPath = path ? `${path}.${field}` : '';

            if (fieldPath) {
              ensureObjectAt(model, parent);
              ensureObjectAt(model, path);
              ensureObjectAt(model, fieldPath, def.default);
            }

            const builder = fromMapFactory(def.builder, field, fieldPath);
            cache.put(cacheKey, builder);
            return builder;
          }
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

const ensureObjectAt = (model: t.BuilderModel<any>, path: string, defaultObject?: () => O) => {
  if (path) {
    const getObject = () => jpath.query(model.state, path)[0];
    if (!getObject()) {
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

    return getObject();
  }
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
        value[index] = typeof def.default === 'function' ? def.default() : {};
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
