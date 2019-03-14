import { Editors, GridSettings } from 'handsontable';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { Subject } from 'rxjs';
import { Handsontable, t, time } from '../../common';

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
   * [Constructor]
   */
  public init() {
    super.init();
  }

  public prepare(
    row: number,
    col: number,
    prop: string | number,
    TD: HTMLElement,
    originalValue: any,
    cellProperties: GridSettings,
  ) {
    super.prepare(row, col, prop, TD, originalValue, cellProperties);
    this._.current = {
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
  private readonly _ = {
    isEditing: false,
    current: undefined as ICurrent | undefined,
  };

  /**
   * [Properties]
   */
  public get guid() {
    return (this.instance as any).guid;
  }

  private get events$(): Subject<t.EditorEvent> {
    return (this.instance as any).__grid.editorEvents$;
  }

  public get props(): t.IEditorProps {
    const current = this._.current;
    return {
      isOpen: this.isOpened(),
      row: current ? current.row : -1,
      column: current ? current.column : -1,
    };
  }

  /**
   * [Methods] (override)
   */

  /**
   * Invoked at the commencement of an editing operation.
   */
  public beginEditing(initialValue?: string) {
    super.beginEditing(initialValue);
    this._.isEditing = true;
    const { row, column } = this.props;
    this.events$.next({
      type: 'GRID/EDITOR/begin',
      payload: {
        grid: this.guid,
        row,
        column,
      },
    });
  }

  /**
   * Invoked when editing is complete.
   */
  public finishEditing(restoreOriginalValue?: boolean, ctrlDown?: boolean, callback?: () => void) {
    super.finishEditing(restoreOriginalValue, ctrlDown, callback);
    if (this._.isEditing) {
      const { row, column } = this.props;
      this.events$.next({
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
    this._.isEditing = false;
  }

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

/**
 * [_____OLD______]
 */
export class Editor2 extends editors.TextEditor {
  public createElements() {
    super.createElements();

    console.log('create elements');

    // this.TEXTAREA

    this.TEXTAREA = document.createElement('input');
    this.TEXTAREA.setAttribute('placeholder', 'Custom placeholder');
    this.TEXTAREA.style.backgroundColor = 'yellow';
    this.TEXTAREA.className = 'handsontableInput';
    // this.textareaStyle = this.TEXTAREA.style;

    const el = (
      <div>
        <input value={'foo'} />
      </div>
    );

    const html = ReactDOMServer.renderToString(el);

    Handsontable.dom.empty(this.TEXTAREA_PARENT);
    // this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);

    this.TEXTAREA_PARENT.innerHTML = html;

    // console.log('this.TEXTAREA_PARENT', this.TEXTAREA_PARENT);

    // Object.keys(this).forEach(k => {
    //   console.log(' > ', k);
    // });
    // console.log('this', this);
  }

  public setValue(newValue: any) {
    console.log('set Value');

    // console.log('this.TEXTAREA', this.TEXTAREA);

    // this.TEXTAREA.value = !newValue ? 'My Value' : newValue;

    // this.TEXTAREA.value = 'foo';
    // this.TEXTAREA.style.backgroundColor = 'yellow';
    // console.log(this.TEXTAREA);

    // console.log('this.TEXTAREA_PARENT', this.TEXTAREA_PARENT);
  }

  public getValue() {
    console.log('getValue');
    return 'getValue';
    // return this.TEXTAREA.value.replace('DD/MM/YYYY', '');
  }

  public focus() {
    super.focus();
    // const col = this.TEXTAREA_PARENT.getElementsByTagName('input');
    const input = this.input;
    if (input) {
      time.delay(100, () => {
        input.select();
        input.focus();
      });
    }
  }

  public beginEditing(initialValue?: string) {
    super.beginEditing(initialValue || 'foo');
    console.log('begin editing', initialValue);
  }

  /**
   * [Internal]
   */

  private get input() {
    const col = this.TEXTAREA_PARENT.getElementsByTagName('input');
    return col[0];
  }
}
