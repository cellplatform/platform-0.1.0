import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CellEditor } from '../../src';
import { Button, color, css, GlamorValue } from '../common';

export type ITestCellEditorProps = { style?: GlamorValue };
export type ITestCellEditorState = {};

export class TestCellEditor extends React.PureComponent<
  ITestCellEditorProps,
  ITestCellEditorState
> {
  public state: ITestCellEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCellEditorState>>();

  private editor!: CellEditor;
  private editorRef = (ref: CellEditor) => (this.editor = ref);

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
      }),
      leftTop: css({
        fontSize: 13,
      }),
      right: css({
        position: 'relative',
        flex: 1,
        padding: 20,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.leftTop}>{this.button('foo', () => null)}</div>
        </div>
        <div {...styles.right}>
          <CellEditor ref={this.editorRef} />
        </div>
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
