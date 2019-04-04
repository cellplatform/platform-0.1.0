import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  CellEditorView,
  ICellEditorViewProps,
} from '../../src/components/CellEditor/CellEditorView';
import { Button, color, css, GlamorValue, t } from '../common';

export type ITestCellEditorProps = { style?: GlamorValue };
export type ITestCellEditorState = {
  formulaValue?: string;
  markdownValue?: string;
  textValue?: string;
};

export class TestCellEditor extends React.PureComponent<
  ITestCellEditorProps,
  ITestCellEditorState
> {
  public state: ITestCellEditorState = {
    formulaValue: 'SUM(1,2,3)',
    markdownValue: 'Markdown',
    textValue: 'Text',
  };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCellEditorState>>();
  private events$ = new Subject<t.CellEditorEvent>();

  private editors: CellEditorView[] = [];
  private editorRef = (ref: CellEditorView) => this.editors.push(ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$.subscribe(e => {
      console.log('🌳', e);
    });

    const changing$ = events$.pipe(
      filter(e => e.type === 'CELL_EDITOR/changing'),
      map(e => e.payload as t.ICellEditorChanging),
    );
    const changed$ = events$.pipe(
      filter(e => e.type === 'CELL_EDITOR/changed'),
      map(e => e.payload as t.ICellEditorChanged),
    );

    changing$.subscribe(e => {
      // e.cancel();
    });

    changed$.subscribe(e => {
      if (e.mode === 'FORMULA') {
        this.state$.next({ formulaValue: e.to });
      }
      if (e.mode === 'MARKDOWN') {
        this.state$.next({ markdownValue: e.to });
      }
      if (e.mode === 'TEXT') {
        this.state$.next({ textValue: e.to });
      }
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
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
            {this.button('focus', () => this.editors[0].focus())}
            {this.button('focus (select)', () => this.editors[0].focus({ selectAll: true }))}
          </div>
        </div>
        <div {...styles.right}>
          {this.renderEditors('formula', { mode: 'FORMULA' })}
          {this.renderEditors('text', { mode: 'TEXT' })}
          {this.renderEditors('markdown', { mode: 'MARKDOWN' })}
        </div>
      </div>
    );
  }

  private renderEditors(title: string, props: ICellEditorViewProps = {}) {
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
          {this.renderEditor({ ...A1, ...props })}
          {this.renderEditor({ ...B2, ...props })}
        </div>
      </div>
    );
  }

  private renderEditor(props: ICellEditorViewProps = {}) {
    const styles = {};

    const { mode } = props;
    let value = '';
    if (mode === 'FORMULA') {
      value = this.state.formulaValue || '';
    }
    if (mode === 'MARKDOWN') {
      value = this.state.markdownValue || '';
    }
    if (mode === 'TEXT') {
      value = this.state.textValue || '';
    }

    return (
      <CellEditorView
        ref={this.editorRef}
        events$={this.events$}
        value={value}
        width={250}
        {...props}
      />
    );
  }

  /**
   * [Handlers]
   */
  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };
}
