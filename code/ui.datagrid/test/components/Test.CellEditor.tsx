import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  CellEditorView,
  ICellEditorViewProps,
} from '../../src/components/CellEditor/CellEditorView';
import { Button, color, css, GlamorValue } from '../common';

export type ITestCellEditorProps = { style?: GlamorValue };
export type ITestCellEditorState = {
  value?:string;
};

export class TestCellEditor extends React.PureComponent<
  ITestCellEditorProps,
  ITestCellEditorState
> {
  public state: ITestCellEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCellEditorState>>();

  private editors: CellEditorView[] = [];
  private editorRef = (ref: CellEditorView) => this.editors.push(ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
          <div {...styles.leftTop}>{this.button('focus', () => this.editors[0].focus())}</div>
        </div>
        <div {...styles.right}>
          {this.renderEditor('formula', { mode: 'FORMULA' })}
          {this.renderEditor('formula', { mode: 'FORMULA', title: 'B3', column: 1, row: 4 })}
          {this.renderEditor('text', { mode: 'TEXT', title: 'B3', column: 1, row: 4 })}
        </div>
      </div>
    );
  }

  private renderEditor(title: string, props: ICellEditorViewProps = {}) {
    const styles = {
      base: css({
        position: 'relative',
        paddingTop: 60,
        paddingBottom: 30,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      title: css({
        Absolute: [5, null, null, 0],
        fontSize: 12,
        opacity: 0.5,
      }),
      editor: css({
        marginLeft: 40,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.title}>{title}</div>
        <CellEditorView
          ref={this.editorRef}
          style={styles.editor}
          value={this.state.value}
          width={250}
          title={'A1'}
          {...props}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };
}
