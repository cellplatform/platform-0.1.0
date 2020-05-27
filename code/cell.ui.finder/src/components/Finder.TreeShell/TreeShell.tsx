import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui } from '../../common';
import { Tree } from './TreeShell.Tree';
import { View } from './TreeShell.View';

export type ITreeShellProps = {
  style?: CssValue;
};

export class TreeShell extends React.PureComponent<ITreeShellProps> {
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Lifecycle]
   */

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

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          <Tree />
        </div>
        <div {...styles.right}>
          <View />
        </div>
      </div>
    );
  }
}
