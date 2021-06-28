import { isUndefinedOrEmptyObject, defaultValue, t } from '../common';

/**
 * Collapses empty values on data objects.
 */
export const Squash = {
  props<T = Record<string, unknown>>(props?: t.ICellProps | t.IRowProps | t.IColumnProps) {
    return Squash.object<T>(props);
  },

  cell<T = t.ICellData>(
    cell?: Record<string, unknown>,
    options: { empty?: Record<string, unknown> } = {},
  ): T | undefined {
    const empty = defaultValue(options.empty, undefined) as T;
    if (!cell) return empty;

    const res = { ...cell };
    Object.keys(res)
      .filter((key) => isUndefinedOrEmptyObject(res[key]))
      .forEach((key) => delete res[key]);
    return Squash.object<T>(res, options);
  },

  object<T = Record<string, unknown>>(
    obj: Record<string, unknown> | undefined,
    options: { empty?: Record<string, unknown> } = {},
  ): T | undefined {
    const empty = defaultValue(options.empty, undefined) as T;
    if (!obj) {
      return empty;
    } else {
      const res = { ...(obj || {}) };
      Object.keys(res)
        .filter((key) => isUndefinedOrEmptyObject(res[key]))
        .forEach((key) => delete res[key]);
      return (isUndefinedOrEmptyObject(res, { ignoreHash: true }) ? empty : res) as T;
    }
  },
};
