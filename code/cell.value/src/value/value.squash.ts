import { defaultValue, t } from '../common';
import { isNilOrEmptyObject } from './util';

/**
 * Collapses empty values on data objects.
 */
export const squash = {
  props(props?: t.ICellProps | t.IRowProps | t.IColumnProps) {
    return squash.object(props);
  },

  cell(cell?: t.ICellData, options: { empty?: undefined | {} } = {}) {
    const empty = defaultValue(options.empty, undefined);
    if (!cell) {
      return empty;
    } else {
      const res = { ...cell };
      Object.keys(res)
        .filter(key => isNilOrEmptyObject(res[key]))
        .forEach(key => delete res[key]);
      return squash.object(res, options);
    }
  },

  object(obj?: object, options: { empty?: undefined | {} } = {}) {
    const empty = defaultValue(options.empty, undefined);
    if (!obj) {
      return empty;
    } else {
      const res = { ...obj };
      Object.keys(res)
        .filter(key => isNilOrEmptyObject(res[key]))
        .forEach(key => delete res[key]);
      return isNilOrEmptyObject(res, { ignoreHash: true }) ? empty : res;
    }
  },
};
