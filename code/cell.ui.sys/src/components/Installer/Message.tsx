import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, time } from '../../common';

export type IMessageProps = {
  text: React.ReactNode;
  countdown?: number;
  style?: CssValue;
};
export type IMessageState = {
  isLoaded?: boolean;
};

export class Message extends React.PureComponent<IMessageProps, IMessageState> {
  public state: IMessageState = {};
  private state$ = new Subject<Partial<IMessageState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    time.delay(10, () => {
      this.state$.next({ isLoaded: true });
    });
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
      base: css({}),
      label: css({
        fontSize: 20,
        fontWeight: 'bolder',
        letterSpacing: -0.8,
        cursor: 'default',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.label}>{this.props.text}</div>
        {this.renderBar()}
      </div>
    );
  }

  private renderBar() {
    const { isLoaded } = this.state;
    const { countdown } = this.props;
    if (!countdown) {
      return null;
    }

    const styles = {
      base: css({
        position: 'relative',
        marginTop: 10,
        backgroundColor: color.format(-0.05),
        height: 5,
      }),
      inner: css({
        Absolute: [0, null, 0, 0],
        backgroundColor: color.format(-0.1),
        width: isLoaded ? '0%' : '100%',
        transition: `width ${countdown}ms linear`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.inner}></div>
      </div>
    );
  }
}
