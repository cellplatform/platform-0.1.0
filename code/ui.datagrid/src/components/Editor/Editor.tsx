import { Editors, GridSettings } from 'handsontable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { filter, share, take, takeUntil, map } from 'rxjs/operators';

import { time, constants, Handsontable, t } from '../../common';
import { IGridRefsPrivate } from '../Grid/types.private';
import { createProvider } from './EditorContext';

const editors = Handsontable.editors as Editors;

type IEditOperation = {
  context: t.IEditorContext;
  from?: t.CellValue;
  to?: t.CellValue;
  isCancelled?: boolean;
};

/**
 * Extension hook for custom editor UI components.
 *
 * This abstracts any connection to Handsontable providing
 * a clean extensibility mechanism for injecting custom cell editor.s
 *
 * See:
 *  - https://handsontable.com/docs/6.2.2/frameworks-wrapper-for-react-custom-editor-example.html
 *  - https://forum.handsontable.com/t/full-custom-editor/2795
 *  - https://stackblitz.com/edit/angular-dirbuj?file=src/app/hello.component.ts
 *
 */
export class Editor extends editors.TextEditor {
  /**
   * [Lifecycle]
   */
  public prepare(
    row: number,
    column: number,
    prop: string | number,
    td: HTMLElement,
    originalValue: any,
    cellProperties: GridSettings,
  ) {
    super.prepare(row, column, prop, td, originalValue, cellProperties);
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    current: undefined as IEditOperation | undefined,
  };

  /**
   * [Properties]
   */

  private get isEditing() {
    return Boolean(this._.current);
  }

  private get context() {
    const column = this.col;
    const row = this.row;
    const grid = this.grid;
    const cell = this.cell;

    const complete = this.onComplete;
    const cancel = this.onCancel;

    const end$ = this.refs.editorEvents$.pipe(
      filter(e => e.type === 'GRID/EDITOR/end'),
      map(e => e as t.IEndEditingEvent),
      take(1),
      share(),
    );
    const keys$ = grid.keys$.pipe(takeUntil(end$));

    keys$
      .pipe(
        filter(e => context.autoCancel),
        filter(e => e.isEscape),
      )
      .subscribe(cancel);

    const context: t.IEditorContext = {
      autoCancel: true,
      grid,
      cell,
      keys$,
      end$,
      complete,
      cancel,
    };

    return context;
  }

  private get refs(): IGridRefsPrivate {
    return (this.instance as any).__gridRefs;
  }

  private get grid() {
    return this.refs.grid;
  }

  private get cell() {
    return this.grid.cell({ row: this.row, column: this.col });
  }

  /**
   * [Methods]
   */

  /**
   * [Override] Initial construction of elements.
   */
  public createElements() {
    super.createElements();
    /**
     * HACK:
     *    Hide the text-editor created in the base-class.
     *    There is a bunch of base-class behavior we want to inherit, so simply
     *    hiding their input and doing our own thing has us maintaining less
     *    code than if we fully implemented from `BaseEditor`.
     */
    this.textareaStyle.display = 'none';
  }

  /**
   * [Override] Called when the editor recieves focus.
   */
  public async focus() {
    // NOTE:  Suppress focus behavior in parent class.
    //        The base-class puts focus on the unused text-area <input>.
  }

  /**
   * [Override] Invoked at the commencement of an editing operation.
   */
  public beginEditing(initialValue?: string) {
    super.beginEditing(initialValue);
    if (this.isEditing) {
      return;
    }

    const grid = this.grid;
    const context = this.context;
    const el = this.render(context);
    if (!el) {
      this.onCancel();
      return;
    }
    const row = this.row;
    const column = this.col;

    // Store state for the current edit operation.
    const from = this.instance.getDataAtCell(this.row, this.col);
    const current: IEditOperation = { context, from };
    this._.current = current;

    // Listener for any cancel operations applied to the [GRID/change] event.
    this.grid.events$
      .pipe(
        takeUntil(context.end$),
        filter(e => e.type === 'GRID/change'),
        map(e => e.payload as t.IGridChange),
        filter(e => e.isCancelled),
        filter(e => e.cell.isPosition({ row, column })),
      )
      .subscribe(e => {
        isCancelled = true;
        this.onCancel();
      });

    // Alert listeners.
    let isCancelled = false;
    this.refs.editorEvents$.next({
      type: 'GRID/EDITOR/begin',
      payload: {
        get cell() {
          return grid.cell({ row, column });
        },
        cancel: () => (isCancelled = true),
      },
    });

    // Check if a listener cancelled the operation.
    if (isCancelled) {
      return this.onCancel();
    }

    // Render the editor from the injected factory.
    ReactDOM.render(el, this.TEXTAREA_PARENT);
  }

  /**
   * [Override] Invoked when editing is complete.
   */
  public finishEditing(restoreOriginalValue?: boolean, ctrlDown?: boolean, callback?: () => void) {
    super.finishEditing(restoreOriginalValue, ctrlDown, callback);
    const current = this._.current;
    if (!current) {
      return;
    }

    const grid = this.grid;
    const row = this.row;
    const column = this.col;
    const isCancelled = current.isCancelled ? true : Boolean(restoreOriginalValue);
    const from = current.from;
    const to = isCancelled ? from : this.getValue();

    // Destroy the editor UI component.
    ReactDOM.unmountComponentAtNode(this.TEXTAREA_PARENT);

    // Alert listeners.
    const e: t.IEndEditingEvent = {
      type: 'GRID/EDITOR/end',
      payload: {
        isCancelled,
        value: { from, to },
        get cell() {
          return grid.cell({ row, column });
        },
      },
    };

    // Finish up.
    this._.current = undefined;
    time.delay(0, () => this.refs.editorEvents$.next(e)); // NB: After delay to ensure event lands after all change events have fired.
  }

  /**
   * [Override] Gets the value of the editor.
   */
  public getValue() {
    const current = this._.current;
    return current ? current.to : undefined;
  }

  /**
   * [Internal]
   */

  private onCancel: t.IEditorContext['cancel'] = () => {
    if (this._.current) {
      this._.current.isCancelled = true;
    }
    const restoreOriginalValue = true;
    this.cancelChanges();
    this.finishEditing(restoreOriginalValue);
    this.close();
  };

  private onComplete: t.IEditorContext['complete'] = args => {
    time.delay(0, () => {
      if (this._.current) {
        this._.current.to = args.value;
      }

      // NOTE:
      //    Run the close operation after a tick-delay
      //    to ensure that (if this call was initiated on a ENTER keydown event)
      //    that another handler does not immediately re-open the editor.
      const restoreOriginalValue = false;
      this.finishEditing(restoreOriginalValue);
      this.close();
    });
  };

  /**
   * Renders the popup-editor within a <Provider> context.
   */
  private render(context: t.IEditorContext) {
    const { row, column } = context.cell;
    const el = this.refs.factory.editor({ row, column });
    if (!el) {
      return null;
    }

    const Provider = createProvider(context);
    const className = constants.CSS_CLASS.EDITOR;
    return (
      <Provider>
        <div className={className}>{el}</div>
      </Provider>
    );
  }
}
