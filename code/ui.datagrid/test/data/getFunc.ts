import { t } from '../common';
import { sys } from '@platform/cell.func/lib/func.sys';

export const getFunc: t.GetFunc = async key => {
  /**
   * 🐷
   * - Func Module lookup and download here.
   */
  return sys.getFunc(key);
};
