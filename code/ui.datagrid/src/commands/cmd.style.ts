import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t, toSelectionValues, DEFAULT, util } from '../common';

const STYLE: t.GridStyleCommand[] = ['BOLD', 'ITALIC', 'UNDERLINE'];

/**
 * Manage style commands.
 */
export function init(args: {
  grid: t.IGrid;
  command$: Observable<t.IGridCommand>;
  fire: t.GridFireEvent;
}) {
  const { grid, command$ } = args;
  const style$ = command$.pipe(
    filter(e => STYLE.includes(e.command as any)),
    filter(e => !e.isCancelled),
  );

  style$.subscribe(e => {
    const command = e.command as t.GridStyleCommand;
    const field = toField(command);
    const values = toSelectionValues({ cells: grid.data.cells, selection: e.selection });
    const defaults = DEFAULT.CELL.PROPS.style;

    // Converts values to the toggled style.
    const changes = Object.keys(values).reduce((acc, key) => {
      const cell = grid.cell(key);
      const value = cell.data.value;
      const error = cell.data.error;
      const props = util.cell.value.toggleCellProp<t.IGridCellPropsAll, 'style'>({
        defaults,
        props: cell.data.props,
        section: 'style',
        field,
      });
      acc[key] = { value, props, error };
      return acc;
    }, {});

    // Update the grid.
    grid.changeCells(changes, { source: 'PROPS/style' });
  });
}

/**
 * [Helpers]
 */

const toField = (command: t.GridStyleCommand): keyof t.IGridCellPropsStyle => {
  switch (command) {
    case 'BOLD':
      return 'bold';
    case 'ITALIC':
      return 'italic';
    case 'UNDERLINE':
      return 'underline';

    default:
      throw new Error(`Command '${command}' not supported`);
  }
};
