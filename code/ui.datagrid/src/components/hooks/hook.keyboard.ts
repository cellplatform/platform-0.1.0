import { Grid } from '../../api';
import { t } from '../../common';

/**
 * Factory for creating a grid's `beforeKeyDown` handler.
 *
 * See:
 *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:beforeKeyDown
 *   - https://jsfiddle.net/handsoncode/n8eft0m1
 *   - https://forum.handsontable.com/t/keyboard-cycling/2802/4
 *
 */
export function beforeKeyDownHandler(getGrid: () => Grid) {
  return function(e: Event) {
    // @ts-ignore
    const table = this as Handsontable;
    const grid = getGrid();
    const payload = toKeydownPayload(e, grid);
    const { cancel, key } = payload;

    // Fire event.
    grid.fire({ type: 'GRID/keydown', payload });

    if (grid.isEditing) {
      // NOTE:  When the editor is showing give it complete control of the keyboard by
      //        supressing any navigation handlers within the `handsontable` until it
      //        has finished its edit-operation.
      e.stopImmediatePropagation();
    }

    // Handle specific keys.
    const last = table.getSelectedLast();
    if (last && !grid.isEditing) {
      const row = last[0];
      const column = last[1];

      // Supress "key cycling".
      //    This is when arrow keys at the edges of the grid jump to the other side of the grid.
      //    Incredibly disorienting for the user - here the madness stops!
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

      // Deletion.
      if (key === 'Backspace' || key === 'Delete') {
        handleDelete({ grid, keydown: payload });
      }
    }
  };
}

/**
 * [Helpers]
 */

function toKeydownPayload(e: Event, grid: Grid): t.IGridKeydown {
  const event = e as KeyboardEvent;
  const key = event.key;
  const isEnter = key === 'Enter';
  const isEscape = key === 'Escape';
  const isDelete = key === 'Delete';
  const { metaKey, shiftKey, ctrlKey, altKey } = event;

  const payload: t.IGridKeydown = {
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
    isCancelled: false,
    cancel: () => {
      e.preventDefault();
      e.stopImmediatePropagation();
      payload.isCancelled = true;
    },
  };

  return payload;
}

function handleDelete(args: { grid: Grid; keydown: t.IGridKeydown }) {
  const { grid, keydown } = args;
  keydown.cancel();

  // Delete the values from the grid.
  const deleted = {};
  Object.keys(grid.selectionValues).forEach(key => (deleted[key] = undefined));
  grid.changeCells(deleted, { source: 'DELETE' });
}
