import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  CellEditorView,
  ICellEditorViewProps,
} from '../../src/components/CellEditor/CellEditorView';
import { color, css, GlamorValue, t } from '../common';

export type ITestCellEditorModeProps = {
  title: string;
  mode: t.CellEditorMode;
  // editor: ICellEditorViewProps;
  style?: GlamorValue;
};
export type ITestCellEditorModeState = {
  value?: string;
  height?: number;
};

export class TestCellEditorMode extends React.PureComponent<
  ITestCellEditorModeProps,
  ITestCellEditorModeState
> {
  public state: ITestCellEditorModeState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCellEditorModeState>>();
  private events$ = new Subject<t.CellEditorEvent>();

  private editors: CellEditorView[] = [];
  private editorRef = (ref: CellEditorView) => this.editors.push(ref);

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const { mode } = this.props;

    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    let value = '';
    if (mode === 'FORMULA') {
      value = '=SUM(1,2,3)';
    }
    if (mode === 'TEXT') {
      value = 'Text';
    }
    if (mode === 'MARKDOWN') {
      value = 'Markdown';
    }
    this.state$.next({ value });

    events$.subscribe(e => {
      console.log('🌳', e.type, e.payload);
    });

    const changing$ = events$.pipe(
      filter(e => e.type === 'CELL_EDITOR/changing'),
      map(e => e.payload as t.ICellEditorChanging),
    );
    const changed$ = events$.pipe(
      filter(e => e.type === 'CELL_EDITOR/changed'),
      map(e => e.payload as t.ICellEditorChanged),
    );
    const size$ = events$.pipe(
      filter(e => e.type === 'CELL_EDITOR/size'),
      map(e => e as t.ICellEditorSizeEvent),
    );

    changing$.subscribe(e => {
      // e.cancel();
    });

    changed$.subscribe(e => {
      this.state$.next({ value: e.value.to });
    });

    size$.subscribe(e => {
      const size = e.payload.to;
      this.state$.next({ height: size.height });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get editor() {
    return this.editors[0];
  }

  /**
   * [Render]
   */

  public render() {
    const { title } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        paddingTop: 80,
        paddingBottom: 60,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      title: css({
        Absolute: [5, null, null, 0],
        fontSize: 12,
        opacity: 0.5,
      }),
      spacer: css({ width: 30 }),
      body: css({
        MarginX: 40,
        Flex: 'horizontal-start-spaceBetween',
      }),
    };

    const A1 = { title: 'A1', column: 0, row: 0 };
    const B2 = { title: 'B2', column: 1, row: 1 };

    return (
      <div {...styles.base}>
        <div {...styles.title}>{title}</div>
        <div {...styles.body}>
          {this.renderEditor({ ...A1 })}
          <div {...styles.spacer} />
          {this.renderEditor({ ...B2 })}
        </div>
      </div>
    );
  }

  private renderEditor(props: ICellEditorViewProps = {}) {
    return (
      <CellEditorView
        ref={this.editorRef}
        events$={this.events$}
        value={this.state.value}
        width={250}
        height={this.state.height}
        {...props}
        mode={this.props.mode}
      />
    );
  }
}
