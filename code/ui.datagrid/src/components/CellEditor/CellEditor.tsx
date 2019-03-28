import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import * as React from 'react';

import { EditorContext, ReactEditorContext } from '../../api';
import { GlamorValue, t, css, time } from '../../common';
import { CellEditorView } from './CellEditorView';

export type ICellEditorProps = {
  events$?: Subject<t.CellEditorEvent>;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

export type ICellEditorState = {
  width?: number;
  height?: number;
  value?: string;
};

export class CellEditor extends React.PureComponent<ICellEditorProps, ICellEditorState> {
  public static THEMES = CellEditorView.THEMES;

  public static contextType = EditorContext;
  public context!: ReactEditorContext;

  public state: ICellEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICellEditorState>>();
  private _events$ = new Subject<t.CellEditorEvent>();
  public events$ = this._events$.pipe(
    takeUntil(this.unmounted$),
    share(),
  );

  private view!: CellEditorView;
  private viewRef = (ref: CellEditorView) => (this.view = ref);

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    let isMounted = false;
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$;
    state$.subscribe(e => this.setState(e));
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Update <input> on keypress.
    const keys$ = this.context.keys$;
    keys$
      .pipe(
        filter(e => e.isEnter),
        filter(() => isMounted),
      )
      .subscribe(e => this.context.complete());

    // this.context.set('foo');

    // Set initial value.
    const value = (this.context.cell.value || '').toString();
    this.state$.next({ value });

    this.context.keys$;

    events$
      .pipe(
        filter(e => e.type === 'CELL_EDITOR/changed'),
        map(e => e.payload as t.ICellEditorChanged),
      )
      .subscribe(e => {
        console.log('changed', e);
        this.state$.next({ value: e.to });
        console.log('this.value', this.value);
      });

    // Keep the editor context up-to-date with the latest value.
    state$.subscribe(e => {
      this.context.set(this.value);
    });

    // Manage cancelling manually.
    // this.context.autoCancel = false;
    // keys$.pipe(filter(e => e.isEscape)).subscribe(e => this.context.cancel());

    // Delay mounted flag to ensure the ENTER key that may have been used to
    // initiate the editor does not immediately close the editor.
    time.delay(100, () => (isMounted = true));
    this.updateSize();
  }

  public componentDidMount() {
    this.view.focus({ selectAll: true });
    this.updateSize();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isFocused() {
    return this.view ? this.view.isFocused : false;
  }

  public get value() {
    return this.state.value || '';
  }

  public get mode(): t.CellEditorMode {
    return this.value.startsWith('=') ? 'FORMULA' : 'TEXT';
  }

  public get size() {
    const cell = this.context.cell;
    const width = cell.td.offsetWidth + (cell.column === 0 ? 0 : 1);
    const height = cell.td.offsetHeight + (cell.row === 0 ? -1 : 0); // NB: Account for table edge differences.
    return { width, height };
  }

  private get cell() {
    return this.context.cell;
  }

  private get row() {
    return this.cell.row || 0;
  }
  private get column() {
    return this.cell.column || 0;
  }

  /**
   * [Methods]
   */
  public updateSize() {
    const { width, height } = this.size;
    this.state$.next({ width, height });
  }

  /**
   * [Render]
   */
  public render() {
    const { width, height } = this.state;
    const key = `editor-${this.column}:${this.row}`;
    return (
      <CellEditorView
        key={key}
        ref={this.viewRef}
        events$={this._events$}
        value={this.state.value}
        theme={this.props.theme}
        mode={this.mode}
        style={this.props.style}
        width={width}
        height={height}
        row={this.row}
        column={this.column}
      />
    );
  }

  /**
   * [Handlers]
   */
  // private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // const value = e.target.value;
  // this.state$.next({ value });
  // time.delay(0, () => this.updateSize());
  // };
}
