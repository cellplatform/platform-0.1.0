import { Grid } from '../grid.api';
import { FactoryManager } from '../factory';
import * as t from '../../types';

/**
 * Private references used internally that are attached
 * to the `Handsontable` instance to monkey-patch betwee
 * different extension points (eg the Grid <=> Editor).
 */
export type IGridRefsPrivate = {
  grid: Grid;
  editorEvents$: t.Subject<t.EditorEvent>;
  factory: FactoryManager;
};
