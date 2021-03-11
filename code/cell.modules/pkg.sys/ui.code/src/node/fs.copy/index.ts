import { copyVs as vs } from './copy.vs';
import { copyDefs as defs } from './copy.defs';

/**
 * File copy helpers.
 */
export const copy = {
  vs,
  defs,
  all() {
    vs();
    defs();
  },
};
