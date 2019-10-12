import { t } from '../common';
import { calculate as one } from './func.calc.cell';
import { calculate as many } from './func.calc.cells';

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
