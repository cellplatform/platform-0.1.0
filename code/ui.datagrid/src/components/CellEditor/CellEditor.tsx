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
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

export type ICellEditorState = {
  width?: number;
  height?: number;
};

export class CellEditor extends React.PureComponent<ICellEditorProps, ICellEditorState> {
  public static THEMES = CellEditorView.THEMES;

  public static contextType = EditorContext;
  public context!: ReactEditorContext;

  public state: ICellEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICellEditorState>>();

  private view!: CellEditorView;
  private viewRef = (ref: CellEditorView) => (this.view = ref);

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    let isMounted = false;
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    this.updateSize();

    // Update <input> on keypress.
    const keys$ = this.context.keys$;
    keys$
      .pipe(
        filter(e => e.isEnter),
        filter(() => isMounted),
      )
      .subscribe(e => this.context.complete());

    // Keep the editor context up-to-date with the latest value.
    state$.subscribe(e => {
      // this.context.set(this.value);
    });
    // this.context.set('foo');

    // Set initial values.
    const value = this.context.cell.value;
    // this.state$.next({ value });

    // Manage cancelling manually.
    // this.context.autoCancel = false;
    // keys$.pipe(filter(e => e.isEscape)).subscribe(e => this.context.cancel());

    // Delay mounted flag to ensure the ENTER key that may have been used to
    // initiate the editor does not immediately close the editor.
    time.delay(100, () => (isMounted = true));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get size() {
    const BORDER_WIDTH = CellEditorView.BORDER_WIDTH;
    const cell = this.context.cell;
    const width = cell.td.offsetWidth - BORDER_WIDTH * 2 + (cell.column === 0 ? 0 : 1);
    const height = cell.td.offsetHeight - BORDER_WIDTH * 2 + (cell.row === 0 ? 0 : 1);
    return { width, height };
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
    return (
      <CellEditorView
        ref={this.viewRef}
        theme={this.props.theme}
        style={this.props.style}
        width={width}
        height={height}
      />
    );
  }

  /**
   * [Handlers]
   */
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const value = e.target.value;
    // this.state$.next({ value });
    // time.delay(0, () => this.updateSize());
  };
}
