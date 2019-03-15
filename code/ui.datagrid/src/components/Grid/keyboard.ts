import { Grid } from '../grid.api/Grid';

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
    grid.next({ type: 'GRID/keydown', payload: { key, event, isEnter, isEscape, cancel } });

    if (grid.isEditing) {
      // NOTE:  When the editor is showing give it complete control of the keyboard,
      //        supress any navigation handlers within the `handsontable` until it
      //        has finished it's operation.
      e.stopImmediatePropagation();
    }

    // @ts-ignore
    const last = this.getSelectedLast();
    if (last) {
      const row = last[0];
      const column = last[1];

      // console.log(`\nTODO 🐷 keydown // handle DOWN/RIGHT at far end of table \n`);

      if (row === 0 && key === 'ArrowUp') {
        cancel();
      }
      if (column === 0 && key === 'ArrowLeft') {
        cancel();
      }
    }
  };
}
