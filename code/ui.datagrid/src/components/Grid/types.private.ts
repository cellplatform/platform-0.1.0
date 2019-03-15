import { Subject } from 'rxjs';
import { Grid } from '../grid.api';

import { EditorEvent, IEditorContext } from '../Editor/types';

/**
 * Private references used internally that are attached
 * to the `Handsontable` instance to monkey-patch betwee
 * different extension points (eg the Grid <=> Editor).
 */
export type IGridRefsPrivate = {
  editorEvents$: Subject<EditorEvent>;
  editorFactory: (args: IEditorContext) => JSX.Element | null;
  api: Grid;
};
