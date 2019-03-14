import { Editors, GridSettings } from 'handsontable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMServer from 'react-dom/server';
import { Subject } from 'rxjs';
import { Handsontable, t, time } from '../../common';
import { IGridRefsPrivate } from '../Grid/types.private';

const editors = Handsontable.editors as Editors;

type ICurrent = {
  row: number;
  column: number;
  TD: HTMLElement;
  originalValue: any;
  cellProperties: GridSettings;
};

/**
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
    col: number,
    prop: string | number,
    TD: HTMLElement,
    originalValue: any,
    cellProperties: GridSettings,
  ) {
    super.prepare(row, col, prop, TD, originalValue, cellProperties);
    this._current = {
      row,
      column: col,
      TD,
      originalValue,
      cellProperties,
    };
  }

  /**
   * [Fields]
   */
  private _isEditing = false;
  private _current!: ICurrent;

  /**
   * [Properties]
   */
  public get guid() {
    return (this.instance as any).guid;
  }

  public get props(): t.IEditorProps {
    const current = this._current;
    return {
      isOpen: this.isOpened(),
      row: current ? current.row : -1,
      column: current ? current.column : -1,
    };
  }

  private get refs(): IGridRefsPrivate {
    return (this.instance as any).__gridRefs;
  }

  /**
   * [Methods] (override)
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
    //        This puts focus on the unused text-area input.
  }

  /**
   * [Override] Invoked at the commencement of an editing operation.
   */
  public beginEditing(initialValue?: string) {
    super.beginEditing(initialValue);
    this._isEditing = true;
    const { row, column } = this.props;
    const td = this._current.TD;

    console.log('td', td);
    console.log(`\nTODO 🐷  Render the editor with context props \n`);

    // Render the editor from the injected factory.
    const el = <div>{this.refs.editorFactory()}</div>;
    ReactDOM.render(el, this.TEXTAREA_PARENT);

    // Alert listeners
    this.refs.editorEvents$.next({
      type: 'GRID/EDITOR/begin',
      payload: {
        grid: this.guid,
        row,
        column,
      },
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

    // Remove the editor HTML.
    const { row, column } = this.props;
    ReactDOM.unmountComponentAtNode(this.TEXTAREA_PARENT);

    // Alert listeners.
    this.refs.editorEvents$.next({
      type: 'GRID/EDITOR/end',
      payload: {
        grid: this.guid,
        row,
        column,
        isCancelled: Boolean(restoreOriginalValue),
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
}
