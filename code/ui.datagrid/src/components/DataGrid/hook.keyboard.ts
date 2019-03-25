import { Grid } from '../../api';
import { t } from '../../common';

/**
 * Factory for creating a grid's `beforeKeyDown` handler.
 *
 * See:
 *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:beforeKeyDown
 *   - https://jsfiddle.net/handsoncode/n8eft0m1/
 *   - https://forum.handsontable.com/t/keyboard-cycling/2802/4
 *
 */
export function beforeKeyDownHandler(getGrid: () => Grid) {
  return function(e: Event) {
    // @ts-ignore
    const table = this as Handsontable;
    const grid = getGrid();
    const payload = toGridKeypress(e, grid);
    const { cancel, key } = payload;

    // Fire event.
    grid.fire({ type: 'GRID/keydown', payload });

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
      if (key === 'ArrowDown' && row === grid.totalRows - 1) {
        cancel();
      }
      if (key === 'ArrowRight' && column === grid.totalColumns - 1) {
        cancel();
      }
    }
  };
}

/**
 * Creates a Grid keydown event object.
 */
export function toGridKeypress(e: Event, grid: Grid): t.IGridKeypress {
  const event = e as KeyboardEvent;
  const key = event.key;
  const isEnter = key === 'Enter';
  const isEscape = key === 'Escape';
  const isDelete = key === 'Delete';
  const { metaKey, shiftKey, ctrlKey, altKey } = event;

  const cancel = () => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  // Fire event.
  return {
    key,
    grid,
    event,
    isEnter,
    isEscape,
    isDelete,
    metaKey,
    shiftKey,
    ctrlKey,
    altKey,
    cancel,
  };
}
