import { t } from '../common';
import { one } from './func.calc.one';
import { many } from './func.calc.many';

/**
 * Calculate references/cells.
 */
export function calculate(args: { getValue: t.RefGetValue; getFunc: t.GetFunc }) {
  const base = args;
  return {
    one: (args: { cell: string; refs: t.IRefs }) => one({ ...base, ...args }),
    many: (args: { cells: string | string[]; refs: t.IRefs }) => many({ ...base, ...args }),
  };
}
