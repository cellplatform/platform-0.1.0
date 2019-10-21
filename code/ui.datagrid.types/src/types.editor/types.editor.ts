import { Observable } from 'rxjs';
import { t } from '../common';

/**
 * Properties that are passed to React editor
 * components as `context`.
 */
export type IEditorContext = {
  isCancelled: boolean;
  autoCancel: boolean; // Automatically cancels on Escape key.
  readonly initial: t.CellValue;
  readonly size: t.ISize | undefined;
  readonly cell: t.IGridCell;
  readonly grid: t.IGrid;
  readonly keys$: Observable<t.IGridKeydown>;
  readonly end$: Observable<t.IEndEditingEvent>;
  readonly value: {
    readonly from?: any;
    readonly to?: any; // Writable, or use `set(...)` method.
  };
  set(args: { value?: any; size?: t.ISize }): IEditorContext;
  cancel(): IEditorContext;
  complete(): IEditorContext;
};
