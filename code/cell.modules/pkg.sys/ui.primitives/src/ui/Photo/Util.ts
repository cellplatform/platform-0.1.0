import { t } from './common';

export const Util = {
  toDefs(inputDef: t.PhotoProps['def'] = []) {
    const defs = Array.isArray(inputDef) ? inputDef : inputDef === undefined ? [] : [inputDef];
    return defs;
  },
};
