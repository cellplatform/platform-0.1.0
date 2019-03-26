import { Editors, GridSettings } from 'handsontable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { filter, share, take, takeUntil, map } from 'rxjs/operators';

import { R, time, constants, Handsontable, t, events } from '../../common';
import { IGridRefsPrivate } from '../../components/DataGrid/types.private';
import { createProvider } from './EditorContext';
import { toGridKeypress } from '../../components/DataGrid/hook.keyboard';

const editors = Handsontable.editors as Editors;

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
    current: undefined as t.IEditorContext | undefined,
  };

  /**
   * [Properties]
   */
  private get isDisposed() {
    return this.grid.isDisposed;
  }

  private get isEditing() {
    return Boolean(this._.current);
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

  private get context() {
    return this._.current;
  }

  /**
   * [Methods]
   */

  /**
   * [Override] Initial construction of elements.
   */
  public createElements() {
    if (this.isDisposed) {
      return;
    }

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
    if (this.isDisposed) {
      return;
    }

    super.beginEditing(initialValue);
    if (this.isEditing) {
      return;
    }

    const grid = this.grid;
    const context = this.createContext();
    const el = this.render(context);
    if (!el) {
      this.onCancel();
      return;
    }
    const row = this.row;
    const column = this.col;

    // Store state for the current edit operation.
    this._.current = context;

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
  public finishEditing(restoreValue?: boolean, ctrlDown?: boolean, callback?: () => void) {
    if (this.isDisposed) {
      return;
    }
    super.finishEditing(restoreValue, ctrlDown, callback);
    const current = this._.current;
    if (!current) {
      return;
    }

    const grid = this.grid;
    const row = this.row;
    const column = this.col;
    const isCancelled = current.isCancelled ? true : Boolean(restoreValue);
    const from = current.value.from;
    const to = isCancelled ? from : this.getValue();

    // Destroy the editor UI component.
    ReactDOM.unmountComponentAtNode(this.TEXTAREA_PARENT);

    // Alert listeners.
    const value = { from, to };
    const isChanged = !R.equals(value.from, value.to);
    const payload: t.IEndEditingEvent['payload'] = {
      value,
      isCancelled,
      isChanged,
      get cell() {
        return grid.cell({ row, column });
      },
      cancel() {
        payload.isCancelled = true;
        grid.cell({ row, column }).value = from; // NB: Revert the value.
      },
    };
    const e: t.IEndEditingEvent = {
      type: 'GRID/EDITOR/end',
      payload,
    };

    // Finish up.
    this._.current = undefined;
    this.refs.editorEvents$.next(e);
  }

  /**
   * [Override] Gets the value of the editor.
   */
  public getValue() {
    const context = this.context;
    return context ? context.value.to : undefined;
  }

  /**
   * [Internal]
   */

  private createContext() {
    const grid = this.grid;
    const cell = this.cell;
    const complete = this.onComplete;

    const cancel = () => {
      context.isCancelled = true;
      this.onCancel();
    };

    const end$ = this.refs.editorEvents$.pipe(
      filter(e => e.type === 'GRID/EDITOR/end'),
      map(e => e as t.IEndEditingEvent),
      take(1),
      share(),
    );

    const keys$ = events.keyUp$.pipe(
      takeUntil(end$),
      map(e => toGridKeypress(e.event, grid)),
      share(),
    );

    keys$
      .pipe(
        filter(e => context.autoCancel),
        filter(e => e.isEscape),
      )
      .subscribe(cancel);

    const from = this.instance.getDataAtCell(this.row, this.col);
    let to = from;
    const value: t.IEditorContext['value'] = {
      from,
      get to() {
        return to;
      },
      set to(change: any) {
        to = change;
      },
    };

    const context: t.IEditorContext = {
      isCancelled: false,
      autoCancel: true,
      grid,
      cell,
      keys$,
      end$,
      value,
      complete,
      cancel,
      set: (value: any) => (context.value.to = value),
    };

    return context;
  }

  private onCancel: t.IEditorContext['cancel'] = () => {
    if (this.isDisposed) {
      return;
    }
    if (this._.current) {
      this._.current.isCancelled = true;
    }
    const restoreOriginalValue = true;
    this.cancelChanges();
    this.finishEditing(restoreOriginalValue);
    this.close();
  };

  private onComplete: t.IEditorContext['complete'] = () => {
    if (this.isDisposed) {
      return;
    }
    // NOTE:
    //    Run the close operation after a tick-delay
    //    to ensure that (if this call was initiated on a ENTER keydown event)
    //    that another handler does not immediately re-open the editor.
    time.delay(0, () => {
      const restoreOriginalValue = false;
      this.finishEditing(restoreOriginalValue);
      this.close();
    });
  };

  /**
   * Renders the popup-editor within a <Provider> context.
   */
  private render(context: t.IEditorContext) {
    const { row, column, value } = context.cell;
    const el = this.refs.factory.editor({ row, column, value });
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
