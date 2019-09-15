import { t } from '../common';
import * as clipboard from './keyboard.clipboard';
import * as style from './keyboard.style';

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

  // Controllers.
  clipboard.init({ grid, fire });
  style.init({ grid, fire });
}
