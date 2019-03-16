import { Grid } from '../api';

/**
 * Factory for creating a grid keydown handler.
 *
 * See:
 *   - https://jsfiddle.net/handsoncode/n8eft0m1/
 *   - https://forum.handsontable.com/t/keyboard-cycling/2802/4
 *
 */
export function keydownHandler(getGrid: () => Grid) {
  return function(e: Event) {
    // @ts-ignore
    const table = this as Handsontable;
    const event = e as KeyboardEvent;
    const grid = getGrid();

    const cancel = () => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    // Fire event.
    const key = event.key;
    const isEnter = key === 'Enter';
    const isEscape = key === 'Escape';
    grid.next({
      type: 'GRID/keydown',
      payload: {
        key,
        event,
        isEnter,
        isEscape,
        cancel,
      },
    });

    if (grid.isEditing) {
      // NOTE:  When the editor is showing give it complete control of the keyboard,
      //        supress any navigation handlers within the `handsontable` until it
      //        has finished it's operation.
      e.stopImmediatePropagation();
    }

    // Supress "key cycling".
    //    This is when arrow keys at the edges of the grid jump to the other
    //    side of the grid.  Incredibly disorienting for the user - so here it stops!
    const last = table.getSelectedLast();
    if (last) {
      const row = last[0];
      const column = last[1];
      if (key === 'ArrowUp' && row === 0) {
        cancel();
      }
      if (key === 'ArrowLeft' && column === 0) {
        cancel();
      }
      if (key === 'ArrowDown' && row === table.countRows() - 1) {
        cancel();
      }
      if (key === 'ArrowRight' && column === table.countCols() - 1) {
        cancel();
      }
    }
  };
}
