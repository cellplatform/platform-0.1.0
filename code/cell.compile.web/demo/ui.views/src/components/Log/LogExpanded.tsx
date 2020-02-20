import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../../common';

import { Icons, Button } from '../primitives';

export type ILogExpandedProps = {
  children?: React.ReactNode;
  style?: CssValue;
  onCloseClick?: (e: {}) => void;
};
export type ILogExpandedState = {};

export class LogExpanded extends React.PureComponent<ILogExpandedProps, ILogExpandedState> {
  public state: ILogExpandedState = {};
  private state$ = new Subject<Partial<ILogExpandedState>>();
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
    const styles = {
      base: css({
        Absolute: 0,
        // width: 300,
        backgroundColor: color.format(0.6),
      }),
      log: css({ Absolute: 0 }),
      bevel: css({
        Absolute: [0, null, 0, -10],
        width: 10,
        backgroundColor: color.format(0.15),
      }),
      closeButton: css({
        Absolute: [2, 5, null, null],
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.bevel} />
        {this.props.children}
        <Button style={styles.closeButton} onClick={this.onCloseClick}>
          <Icons.Close />
        </Button>
      </div>
    );
  }

  /**
   * Handlers
   */
  private onCloseClick = () => {
    const { onCloseClick } = this.props;
    if (onCloseClick) {
      onCloseClick({});
    }
  };
}
