import { Editors, GridSettings } from 'handsontable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { filter, share, take, takeUntil, map } from 'rxjs/operators';

import { time, constants, events, Handsontable, t } from '../../common';
import { IGridRefsPrivate } from '../Grid/types.private';
import { createProvider } from './EditorContext';

const editors = Handsontable.editors as Editors;

type ICurrent = {
  row: number;
  column: number;
  td: HTMLElement;
  originalValue: any;
  cellProperties: GridSettings;
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
    this._.current = { row, column, td, originalValue, cellProperties };
  }

  /**
   * [Fields]
   */

  private readonly _ = {
    isEditing: false,
    value: undefined as any,
    current: undefined as ICurrent | undefined,
  };

  /**
   * [Properties]
   */
  public get props() {
    const current = this._.current;
    const column = current ? current.column : -1;
    const row = current ? current.row : -1;
    const isOpen = this.isOpened();
    return { isOpen, column, row };
  }

  private get context() {
    const { column, row } = this.props;
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
      column,
      row,
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
     *    code that if we fully implemented from `BaseEditor`.
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
    if (this._.isEditing) {
      return;
    }

    const el = this.render();
    if (!el) {
      this.onCancel();
      return;
    }

    this._.isEditing = true;
    this._.value = undefined;

    // Render the editor from the injected factory.
    ReactDOM.render(el, this.TEXTAREA_PARENT);

    // Alert listeners
    const { row, column } = this.props;
    this.refs.editorEvents$.next({
      type: 'GRID/EDITOR/begin',
      payload: { row, column },
    });
  }

  /**
   * [Override] Invoked when editing is complete.
   */
  public finishEditing(restoreOriginalValue?: boolean, ctrlDown?: boolean, callback?: () => void) {
    super.finishEditing(restoreOriginalValue, ctrlDown, callback);

    // console.group('🌳 FINISH');
    // console.log('restoreOriginalValue', restoreOriginalValue);
    // console.groupEnd();

    if (!this._.isEditing) {
      return;
    }
    this._.isEditing = false;

    const { row, column } = this.props;
    const isCancelled = Boolean(restoreOriginalValue);

    // Destroy the editor UI component.
    ReactDOM.unmountComponentAtNode(this.TEXTAREA_PARENT);

    // Alert listeners.
    this.refs.editorEvents$.next({
      type: 'GRID/EDITOR/end',
      payload: {
        row,
        column,
        isCancelled,
        value: { to: this.getValue() },
      },
    });
  }

  /**
   * [Override] Gets the value of the editor.
   */
  public getValue() {
    return this._.value;
  }

  /**
   * [Internal]
   */

  private onCancel: t.IEditorContext['cancel'] = () => {
    const restoreOriginalValue = true;
    this.cancelChanges();
    this.finishEditing(restoreOriginalValue);
    this.close();
  };

  private onComplete: t.IEditorContext['complete'] = args => {
    time.delay(0, () => {
      console.log('COMPLETE', args);
      this._.value = args.value;

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

  private render() {
    const context = this.context;
    const { row, column } = context;
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
