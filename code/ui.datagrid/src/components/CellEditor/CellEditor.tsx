import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../../common';

export type ICellEditorProps = { style?: GlamorValue };
export type ICellEditorState = {};

export class CellEditor extends React.PureComponent<ICellEditorProps, ICellEditorState> {
  public state: ICellEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICellEditorState>>();

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
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>CellEditor</div>
      </div>
    );
  }
}
