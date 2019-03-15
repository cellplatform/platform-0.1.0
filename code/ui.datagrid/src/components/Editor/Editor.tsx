import { Editors, GridSettings } from 'handsontable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { time, Handsontable, t, constants } from '../../common';
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
 * See:
 *  - https://handsontable.com/docs/6.2.2/frameworks-wrapper-for-react-custom-editor-example.html
 *  - https://forum.handsontable.com/t/full-custom-editor/2795
 *  - https://stackblitz.com/edit/angular-dirbuj?file=src/app/hello.component.ts
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
    this._current = { row, column, td, originalValue, cellProperties };
  }

  /**
   * [Fields]
   */
  private _isEditing = false;
  private _current!: ICurrent;

  /**
   * [Properties]
   */
  public get props() {
    const current = this._current;
    const column = current ? current.column : -1;
    const row = current ? current.row : -1;
    const isOpen = this.isOpened();
    const grid = this.refs.api;
    const context: t.IEditorContext = { column, row, grid };
    return { isOpen, column, row, context };
  }

  private get refs(): IGridRefsPrivate {
    return (this.instance as any).__gridRefs;
  }

  private get elEditor(): HTMLDivElement | undefined {
    const el = this.TEXTAREA_PARENT.firstChild;
    return el ? (el as HTMLDivElement) : undefined;
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
    this._isEditing = true;
    const { row, column } = this.props;

    // Render the editor from the injected factory.
    ReactDOM.render(this.render(), this.TEXTAREA_PARENT);

    // Alert listeners
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
    if (!this._isEditing) {
      return;
    }
    this._isEditing = false;
    const { row, column } = this.props;
    const isCancelled = Boolean(restoreOriginalValue);

    // Remove the editor HTML.
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
    // console.log('getValue');
    // return super.getValue();
    return 'foo';
  }

  // public saveValue(val?: any, ctrlDown?: boolean) {
  //   console.log('saveValue', val, ctrlDown);
  //   super.saveValue(val, ctrlDown);
  // }
  // public setValue(newValue?: any) {
  //   console.log('setValue');
  //   super.setValue(newValue);
  // }

  /**
   * [Internal]
   */
  /**
   * Renders the popup-editor within a <Provider> context.
   */
  private render() {
    const { context } = this.props;
    const Provider = createProvider(context);
    const el = this.refs.editorFactory(context);
    const className = constants.CSS_CLASS.EDITOR;
    return (
      <Provider>
        <div className={className}>{el}</div>
      </Provider>
    );
  }
}
