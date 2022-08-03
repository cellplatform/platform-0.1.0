import { IMemoryCache, MemoryCache } from '@platform/cache';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { dispose, jpath, t, StateObject } from './common';

type O = Record<string, unknown>;
type B = t.BuilderChain<any>;
type K = t.BuilderMethodKind;

/**
 * A generic (strongly typed) object builder in the form of a chained ("fluent") API.
 * Types:
 *    <M> Model
 *    <A> API
 */
export function create<M extends O, F extends O>(args: {
  handlers: t.BuilderHandlers<M, F>;
  model: t.BuilderModel<M>;
  parent?: B;

  // [Internal]
  path?: string;
  index?: number;
  cache?: IMemoryCache;
  kind?: t.BuilderMethodKind;
  dispose$?: Observable<void>;
}): t.BuilderChain<F> {
  const { handlers, parent, kind = 'ROOT', model } = args;
  const index = args.index === undefined || args.index < 0 ? -1 : args.index;
  const cache = args.cache || MemoryCache.create();

  const builder = dispose.create();
  const dispose$ = builder.dispose$;

  (builder as any).__KIND__ = 'BUILDER'; // NB: See [Builder.isBuilder(...)] method.

  if (args.dispose$) {
    args.dispose$.pipe(take(1)).subscribe(() => builder.dispose());
  }

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
    .map((key) => ({ key, handler: handlers[key] as t.BuilderHandler<M, F> }))
    .forEach(({ key, handler }) => {
      builder[key] = (...params: any[]) => {
        const handlerArgs: t.BuilderHandlerArgs<M, F> = {
          kind,
          key,
          index,
          params,
          builder: { parent, self: builder as t.BuilderChain<F>, dispose$ },
          path: args.path === undefined ? '$' : `${args.path || '$'}`,
          model,
          is: { list: is.list(kind), map: is.map(kind) },
          clone(props?: Partial<M>) {
            const initial = { ...args.model.state, ...props };
            const model = StateObject.create<M>(initial);
            return create<M, F>({ model, handlers });
          },
        };
        const res = handler(handlerArgs);
        return res === undefined ? builder : res;
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
              const factory = fromFactory({ model, parent, dispose$, params: [] });
              return factory.map('object', def.builder, key, path); // <== RECURSION 🌳
            });
          },
        });
      }

      /**
       * Array list (accessed by index).
       */
      if (def.kind === 'list:byIndex') {
        builder[key] = (...params: any[]) => {
          const input: t.BuilderIndexParam | undefined = params[0];
          const path = formatPath(def.path);
          const list = findListOrThrow(model, path);
          const index = deriveListIndex(list, input);
          const cacheKey = `${def.kind}:${path}:${key}[${index}]`;

          ensureDefaultAtIndex(model, path, index, def.default);

          return getOrCreate(cacheKey, () => {
            const parent = builder;
            const factory = fromFactory({ model, parent, dispose$, params });
            return factory.list('list:byIndex', def.builder, index, path, ''); // <== RECURSION 🌳
          });
        };
      }

      /**
       * Array list (accessed by "name").
       */
      if (def.kind === 'list:byName') {
        builder[key] = (...params: any[]) => {
          const name = params[0];
          if (typeof name !== 'string' || !name.trim()) {
            throw new Error(`Name of list item not given.`);
          }

          const i = params[1] as t.BuilderIndexParam | undefined;
          const path = formatPath(def.path);
          const list = findListOrThrow(model, path);
          const index = findListIndexByName(list, name, i);
          const cacheKey = `${def.kind}:${path}:${key}[${index}]`;

          ensureDefaultAtIndex(model, path, index, def.default);

          const builder = getOrCreate(cacheKey, () => {
            const parent = builder;
            const factory = fromFactory({ model, parent, dispose$, params });
            return factory.list('list:byName', def.builder, index, path, name); // <== RECURSION 🌳
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
        builder[key] = (...params: any[]) => {
          const field = params[0];
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
            const factory = fromFactory({ model, parent, dispose$, params });
            return factory.map('map', def.builder, field, fieldPath); // <== RECURSION 🌳
          });
        };
      }
    });

  // Finish up.
  return builder as t.BuilderChain<F>;
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

const fromFactory = (args: {
  model: t.BuilderModel<any>;
  parent: t.BuilderChain<any>;
  dispose$: Observable<void>;
  params: any[];
}) => {
  const { parent, dispose$, params } = args;

  return {
    /**
     * Create [list] builder from factory.
     */
    list(
      kind: t.BuilderMethodKindList,
      factory: t.BuilderListFactory<any, any>,
      index: number,
      path: string,
      name: string,
    ) {
      return factory({
        index,
        name,
        path,
        model: args.model,
        builder: { parent, dispose$ },
        params,
        create<M extends O, F extends O>(
          handlers: t.BuilderHandlers<M, F>,
          model?: t.BuilderModel<M>,
        ) {
          model = model || args.model;
          return create<M, F>({ kind, parent, model, handlers, path, index, dispose$ });
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
        builder: { parent, dispose$ },
        params,
        create<M extends O, F extends O>(
          handlers: t.BuilderHandlers<M, F>,
          model?: t.BuilderModel<M>,
        ) {
          model = model || args.model;
          return create<M, F>({ kind, parent, model, handlers, path, dispose$ });
        },
      });
    },
  };
};
