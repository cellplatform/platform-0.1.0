import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  CellEditorView,
  ICellEditorViewProps,
} from '../../src/components/CellEditor/CellEditorView';
import { Button, color, css, GlamorValue, t } from '../common';
import { TestCellEditorMode } from './Test.CellEditorMode';

export type ITestCellEditorProps = { style?: GlamorValue };
export type ITestCellEditorState = {};

export class TestCellEditor extends React.PureComponent<
  ITestCellEditorProps,
  ITestCellEditorState
> {
  public state: ITestCellEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCellEditorState>>();
  private events$ = new Subject<t.CellEditorEvent>();

  private instances: TestCellEditorMode[] = [];
  private instanceRef = (ref: TestCellEditorMode) => this.instances.push(ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

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
      //
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
    return this.instances[0].editor;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Flex: 'horizontal',
        flex: 1,
      }),
      left: css({
        position: 'relative',
        width: 200,
        padding: 10,
        lineHeight: 1.6,
        Flex: 'vertical-spaceBetween',
        borderRight: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: color.format(-0.05),
      }),
      leftTop: css({
        fontSize: 13,
      }),
      right: css({
        position: 'relative',
        flex: 1,
        PaddingX: 20,
        paddingTop: 10,
        backgroundColor: color.format(1),
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.leftTop}>
            {this.button('focus', () => this.editor.focus())}
            {this.button('selectAll', () => this.editor.selectAll().focus())}
            {this.button('cursorToStart', () => this.editor.cursorToStart().focus())}
            {this.button('cursorToEnd', () => this.editor.cursorToEnd().focus())}
          </div>
        </div>
        <div {...styles.right}>
          {this.renderEditor('FORMULA')}
          {this.renderEditor('TEXT')}
          {this.renderEditor('MARKDOWN')}
        </div>
      </div>
    );
  }

  private renderEditor(mode: t.CellEditorMode) {
    return <TestCellEditorMode ref={this.instanceRef} title={mode.toLowerCase()} mode={mode} />;
  }

  /**
   * [Handlers]
   */
  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };
}
