import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t, toSelectionValues, DEFAULT } from '../common';

const STYLE: t.GridStyleCommand[] = ['BOLD', 'ITALIC', 'UNDERLINE'];

/**
 * Manage style commands.
 */
export function init(args: {
  grid: t.IGrid;
  command$: Observable<t.IGridCommand>;
  fire: t.FireGridEvent;
}) {
  const { grid, command$, fire } = args;
  const style$ = command$.pipe(
    filter(e => STYLE.includes(e.command as any)),
    filter(e => !e.isCancelled),
  );

  const toggle = (
    field: keyof t.ICellPropsStyle,
    style: t.ICellPropsStyle | undefined,
    defaults: t.ICellPropsStyle,
    value?: boolean,
  ) => {
    const props = style || {};
    const flag =
      typeof value === 'boolean' ? value : typeof props[field] === 'boolean' ? !props[field] : true;
    const res = { ...props, [field]: flag };

    if (res[field] === defaults[field]) {
      delete res[field];
    }

    return res;
  };

  style$.subscribe(e => {
    const command = e.command as t.GridStyleCommand;
    const field = toField(command);
    const values = toSelectionValues({ values: grid.values, selection: e.selection });

    // Converts values to the toggled style.
    let flag: boolean | undefined;
    const changes = Object.keys(values).reduce((acc, key) => {
      const cell = grid.cell(key);
      const value = cell.value;
      const props = cell.props;

      const style = toggle(field, props.style, DEFAULT.CELL.PROPS.STYLE, flag);
      flag = style[field]; // NB: Stored so that all future toggles use the first derived value.

      acc[key] = { value, props: { ...props, style } };
      return acc;
    }, {});

    // Update the grid.
    grid.changeCells(changes, { source: 'PROPS/style' });
  });
}

/**
 * [Helpers]
 */

const toField = (command: t.GridStyleCommand): keyof t.ICellPropsStyle => {
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
