import { Subject } from 'rxjs';

import { t } from '../common';
import { many } from './calculate.many';
import { one } from './calculate.one';

/**
 * Calculate references/cells.
 */
export function calculate(args: {
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
  events$?: Subject<t.FuncEvent>;
}) {
  const base = args;
  return {
    one: (args: { cell: string; refs: t.IRefs; eid?: string }) => one({ ...base, ...args }),
    many: (args: { cells: string | string[]; refs: t.IRefs; eid?: string }) =>
      many({ ...base, ...args }),
  };
}
