const lib = require('deep-diff');
import * as t from 'deep-diff';

export {
  DiffNew,
  DiffDeleted,
  DiffEdit,
  DiffArray,
  Diff,
  PreFilter,
  PreFilterFunction,
  PreFilterObject,
} from 'deep-diff';

/**
 * Calculate differences between to objects.
 */
export function compare<LHS, RHS = LHS>(
  left: LHS,
  right: RHS,
  prefilter?: t.PreFilter<LHS, RHS>,
): Array<t.Diff<LHS, RHS>> {
  return lib(left, right, prefilter) || [];
}
