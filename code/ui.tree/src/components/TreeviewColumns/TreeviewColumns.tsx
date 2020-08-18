import { color, css, CssValue } from '@platform/css';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t } from '../../common';
import { ITreeviewProps } from '../Treeview';

export type ITreeviewColumnsProps = ITreeviewProps & { total?: number };
export type ITreeviewColumnsState = t.Object;

export class TreeviewColumns extends React.PureComponent<
  ITreeviewColumnsProps,
  ITreeviewColumnsState
> {
  public state: ITreeviewColumnsState = {};
  private state$ = new Subject<Partial<ITreeviewColumnsState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get total() {
    const total = this.props.total === undefined ? 2 : this.props.total;
    return Math.max(total, 0);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>TreeviewColumns: {this.total}</div>
      </div>
    );
  }
}
