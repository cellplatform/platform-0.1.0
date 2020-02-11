import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t } from '../../common';
import { Icons } from '../primitives';

export type ILogCollapsedProps = {
  items?: t.ILogItem[];
  style?: CssValue;
  onExpandClick?: (e: {}) => void;
};
export type ILogCollapsedState = {};

export class LogCollapsed extends React.PureComponent<ILogCollapsedProps, ILogCollapsedState> {
  public state: ILogCollapsedState = {};
  private state$ = new Subject<Partial<ILogCollapsedState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */

  public render() {
    const { items = [] } = this.props;
    const count = items.length;

    const styles = {
      base: css({
        Absolute: [10, 10, null, null],
        border: `solid 1px ${color.format(0.8)}`,
        borderRadius: 3,
        backgroundColor: color.format(0.1),
        Flex: 'horizontal-center-center',
        fontSize: 13,
        userSelect: 'none',
        cursor: 'pointer',
      }),
      left: css({
        Flex: 'horizontal-center-center',
        paddingLeft: 10,
        paddingRight: 14,
        PaddingY: 4,
        borderRight: `solid 1px ${color.format(1)}`,
      }),
      leftText: css({
        paddingLeft: 4,
      }),
      right: css({
        boxSizing: 'border-box',
        PaddingX: 10,
        minWidth: 28,
        textAlign: 'center',
      }),
    };
    return (
      <div {...styles.base} onClick={this.props.onExpandClick}>
        <div {...styles.left}>
          <Icons.History size={20} color={1} />
          <div {...styles.leftText}>History</div>
        </div>
        <div {...styles.right}>{count || '-'}</div>
      </div>
    );
  }
}
