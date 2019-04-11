import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { EditorContext, ReactEditorContext } from '../../api';
import { GlamorValue, t, time } from '../../common';
import { CellEditorView } from './CellEditorView';

export type ICellEditorProps = {
  events$?: Subject<t.CellEditorEvent>;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  textMode?: 'MARKDOWN' | 'TEXT';
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
    let isReady = false;
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$;

    // Bubble events.
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Set initial value.
    const value = (this.context.cell.value || '').toString();
    this.state$.next({ value });

    // Handle keypresses.
    const keys$ = this.context.keys$.pipe(filter(() => isReady));
    const enterKey$ = keys$.pipe(filter(e => e.isEnter));
    enterKey$
      .pipe(filter(e => (this.mode === 'MARKDOWN' ? !(e.metaKey || e.shiftKey) : true)))
      .subscribe(e => {
        const value = this.value;
        const size = this.size;
        this.context.set({ value, size }).complete();
      });

    // Keep the local `value` state in sync with the editor view.
    events$
      .pipe(
        filter(e => e.type === 'CELL_EDITOR/changed'),
        map(e => e.payload as t.ICellEditorChanged),
      )
      .subscribe(e => {
        this.state$.next({ value: e.value.to });
      });

    // Keep the size in sync with the editor's reported size.
    events$
      .pipe(
        filter(e => e.type === 'CELL_EDITOR/size'),
        map(e => e.payload as t.ICellEditorSize),
      )
      .subscribe(e => {
        this.updateSize({
          width: this.cellSize.width,
          height: e.to.height,
        });
      });

    // Keep the editor context up-to-date with the latest value.
    state$.subscribe(e => this.context.set({ value: this.value }));

    // Manage cancelling manually.
    // this.context.autoCancel = false;
    // keys$.pipe(filter(e => e.isEscape)).subscribe(e => this.context.cancel());

    // Delay the `isReady` flag to ensure the ENTER key that may have
    // been used to initiate the editor does not immediately close the editor.
    time.delay(100, () => (isReady = true));

    // Finish up.
    this.updateSize();
  }

  public componentDidMount() {
    this.updateSize();
    this.cursorToEnd().focus();
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
    const { textMode = 'MARKDOWN' } = this.props;
    return this.value.startsWith('=') ? 'FORMULA' : textMode;
  }

  public get cellSize(): t.ISize {
    // NB: +/- 1 on size values based on position accounts for table edge differences.
    const cell = this.context.cell;
    return {
      get width() {
        return cell.td.offsetWidth + (cell.column === 0 ? 0 : 1);
      },
      get height() {
        return cell.td.offsetHeight + (cell.row === 0 ? 0 : +1);
      },
    };
  }

  public get size(): t.ISize {
    const state = this.state;
    const cell = this.cellSize;
    return {
      get width() {
        return Math.max(state.width || 0, cell.width);
      },
      get height() {
        return Math.max(state.height || 0, cell.height);
      },
    };
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
  public focus() {
    if (this.view) {
      this.view.focus();
    }
    return this;
  }

  public selectAll() {
    if (this.view) {
      this.view.selectAll();
    }
    return this;
  }

  public cursorToStart() {
    if (this.view) {
      this.view.cursorToStart();
    }
    return this;
  }

  public cursorToEnd() {
    if (this.view) {
      this.view.cursorToEnd();
    }
    return this;
  }

  private updateSize(size?: t.ISize) {
    const { width, height } = size || this.cellSize;
    this.state$.next({ width, height });
    return this;
  }

  /**
   * [Render]
   */
  public render() {
    const { width, height } = this.size;
    const key = `editor-${this.column}:${this.row}`;
    const title = this.context.cell.key;
    return (
      <CellEditorView
        key={key}
        ref={this.viewRef}
        title={title}
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
