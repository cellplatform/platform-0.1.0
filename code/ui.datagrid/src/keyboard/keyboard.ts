import { t } from '../common';
import { BindingMonitor } from './BindingMonitor';

/**
 * Initialize all controller modules.
 */
export function init(args: { grid: t.IGrid; fire: t.FireGridEvent }) {
  const { grid } = args;

  // Common command-event-firing helper.
  const fire: t.FireGridKeyboardCommandEvent = (command, e, props) => {
    const payload: t.IGridCommand = {
      command,
      grid,
      selection: grid.selection,
      props: props || {},
      isCancelled: false,
      cancel: () => {
        payload.isCancelled = true;
        e.cancel();
      },
    };
    args.fire({ type: 'GRID/command', payload });
  };

  // Monitor keyboard commands.
  const bindings = new BindingMonitor({ grid });
  const monitor = (cmd: t.GridCommand) => bindings.monitor(cmd, e => fire(cmd, e));

  // Clipboard.
  monitor('CUT');
  monitor('COPY');
  monitor('PASTE');

  // Style.
  monitor('BOLD');
  monitor('ITALIC');
  monitor('UNDERLINE');
}
