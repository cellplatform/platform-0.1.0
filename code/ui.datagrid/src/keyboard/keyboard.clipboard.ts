import { t } from '../common';
import { BindingMonitor } from './BindingMonitor';

/**
 * Manages clipboard operations.
 */
export function init(args: { grid: t.IGrid; fire: t.FireGridKeyboardCommandEvent }) {
  const { grid } = args;
  const bindings = new BindingMonitor({ grid });

  const monitor = (cmd: t.GridClipboardCommand) => bindings.monitor(cmd, e => args.fire(cmd, e));
  monitor('CUT');
  monitor('COPY');
  monitor('PASTE');
}
