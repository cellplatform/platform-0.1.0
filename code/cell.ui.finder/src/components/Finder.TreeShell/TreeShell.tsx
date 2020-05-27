import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui } from '../../common';
import { Tree } from './Tree';

export type ITreeShellProps = {
  style?: CssValue;
};

export type ITreeShellState = {
  view?: React.ReactNode;
};

export class TreeShell extends React.PureComponent<ITreeShellProps, ITreeShellState> {
  public state: ITreeShellState = {};
  private state$ = new Subject<Partial<ITreeShellState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

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
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      left: css({
        position: 'relative',
        display: 'flex',
        width: 240,
        borderRight: `solid 1px ${color.format(-0.15)}`,
      }),
      right: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
      }),
    };

    const elBody = null; // TEMP 🐷

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          <Tree />
        </div>
        <div {...styles.right}>{elBody}</div>
      </div>
    );
  }
}
