import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import { t, coord } from '../../common';

const defaultGetFunc: t.GetFunc = async args => {
  return undefined;
};

/**
 * Manage keeping the grid calculations up-to-date.
 */
export function manageUpdates(args: { getFunc?: t.GetFunc; grid: t.IGrid }) {
  const { grid } = args;
  const { events$ } = grid;
  const getFunc = args.getFunc || defaultGetFunc;

  const getValue: t.RefGetValue = async key => {
    const cell = grid.values[key];
    return cell && typeof cell.value === 'string' ? cell.value : undefined;
  };

  const table = coord.refs.table({
    getKeys: async () => Object.keys(grid.values),
    getValue,
  });

  console.log('manage');

  const calculateCells = async (args: { cells: string | string[] }) => {
    const { cells } = args;

    // Calculate updates.
    await table.refs({ range: cells, force: true });
    const refs = await table.refs({});
    const res = await coord.func.update({ cells, refs, getValue, getFunc });

    // Prepare grid update set.
    const changes: t.IGridCells = {};
    const addChange = (key: string, value: any) => {
      let cell = grid.values[key];
      if (cell) {
        const props = value === undefined ? cell.props : { ...cell.props, value };
        cell = { ...cell, props };
        changes[key] = cell;
      }
    };

    // Update grid.
    res.list.forEach(item => addChange(item.cell, item.data));
    grid.changeCells(changes);
  };

  /**
   * Cells changed.
   */
  events$
    .pipe(
      filter(e => e.type === 'GRID/cells/change'),
      map(e => e.payload as t.IGridCellsChange),
      // delay(0),
    )
    .subscribe(e => {
      const cells = e.changes.map(change => change.cell.key);

      console.log('changed', cells);

      // console.group('🌳 xxxxxxxx');
      // console.log('e', e);
      // console.groupEnd();

      // TEMP 🐷 not all cells
      calculateCells({ cells: Object.keys(grid.values) });
    });

  /**
   * Editor operation end.
   */
  // events$
  //   .pipe(
  //     filter(() => true),
  //     filter(e => e.type === 'GRID/EDITOR/end'),
  //     map(e => e.payload as t.IEndEditing),
  //   )
  //   .subscribe(e => {
  //     console.group('🌳 xxxxxxxx');
  //     console.log('e', e);
  //     console.groupEnd();
  //   });

  //
}
