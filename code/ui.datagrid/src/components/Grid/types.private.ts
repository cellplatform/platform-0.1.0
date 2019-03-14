import { Subject } from 'rxjs';

import { EditorEvent } from '../../types';

/**
 * Private references used internally that are attached
 * to the `Handsontable` instance to monkey-patch betwee
 * different extension points (eg the Grid <=> Editor).
 */
export type IGridRefsPrivate = {
  editorEvents$: Subject<EditorEvent>;
  editorFactory: () => JSX.Element | null;
};
