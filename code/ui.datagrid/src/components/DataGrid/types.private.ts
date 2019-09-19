import { Subject } from 'rxjs';

import { t } from '../../common';
import { FactoryManager } from '../../factory';

/**
 * Private references used internally that are attached
 * to the `Handsontable` instance to monkey-patch betwee
 * different extension points (eg the Grid <=> Editor).
 */
export type IGridRefsPrivate = {
  grid: t.IGrid;
  editorEvents$: Subject<t.EditorEvent>;
  factory: FactoryManager;
};

/**
 * https://handsontable.com/docs/7.0.0/tutorial-using-callbacks.html#page-source-definition
 *
 * NOTES (from `handsontable` docs):
 *
 *    Some hooks are triggered from the inside of the Handsontable (Core) and some from the plugins.
 *    In some situations it is helpful to know what triggered the callback (if it was done by
 *    Handsontable itself, triggered from external code or a user action). That's why in crucial
 *    hooks Handsontable delivers source as an argument which informs you about who've triggered the
 *    action.
 *    Thanks to source you can create additional conditions based on that information.
 */
export type TableEventSource =
  | 'auto'
  | 'edit'
  | 'loadData'
  | 'populateFromArray'
  | 'spliceCol'
  | 'spliceRow'
  | 'timeValidate'
  | 'dateValidate'
  | 'validateCells'
  | 'Autofill.fill'
  | 'Autofill.fill'
  | 'ContextMenu.clearColumns'
  | 'ContextMenu.columnLeft'
  | 'ContextMenu.columnRight'
  | 'ContextMenu.removeColumn'
  | 'ContextMenu.removeRow'
  | 'ContextMenu.rowAbove'
  | 'ContextMenu.rowBelow'
  | 'CopyPaste.paste'
  | 'ObserveChanges.change'
  | 'UndoRedo.redo'
  | 'UndoRedo.undo'
  | 'GantChart.loadData'
  | 'ColumnSummary.set'
  | 'ColumnSummary.reset';
