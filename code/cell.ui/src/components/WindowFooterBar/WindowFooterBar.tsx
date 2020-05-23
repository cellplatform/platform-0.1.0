import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, defaultValue, COLORS } from '../../common';
import { WindowTitleBar } from '../WindowTitleBar';

export type IWindowFooterBarProps = {
  children?: React.ReactNode;
  height?: number;
  style?: CssValue;
};
export type IWindowFooterBarState = { isFocused?: boolean };

export class WindowFooterBar extends React.PureComponent<
  IWindowFooterBarProps,
  IWindowFooterBarState
> {
  public state: IWindowFooterBarState = {};
  private state$ = new Subject<Partial<IWindowFooterBarState>>();
  private unmounted$ = new Subject<{}>();

  public static HEIGHT = 24;
  public static GRADIENT = WindowTitleBar.GRADIENT;

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowFooterBarProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.updateState();

    window.addEventListener('focus', this.updateState);
    window.addEventListener('blur', this.updateState);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();

    window.removeEventListener('focus', this.updateState);
    window.removeEventListener('blur', this.updateState);
  }

  /**
   * [Properties]
   */
  public get height() {
    return defaultValue(this.props.height, WindowTitleBar.HEIGHT);
  }

  public get isFocused() {
    return document.hasFocus();
  }

  /**
   * [Methods]
   */

  private updateState = () => {
    this.state$.next({ isFocused: this.isFocused });
  };

  /**
   * [Render]
   */
  public render() {
    const { isFocused } = this.state;
    const styles = {
      base: css({
        position: 'relative',
        WebkitAppRegion: 'drag',
        height: WindowFooterBar.HEIGHT,
        boxSizing: 'border-box',
        borderTop: `solid 1px ${color.format(isFocused ? -0.2 : -0.08)}`,
        background: isFocused ? WindowTitleBar.GRADIENT : color.format(-0.03),
        userSelect: 'none',
        color: COLORS.DARK,
        fontSize: 12,
      }),
      body: css({
        Absolute: 0,
        display: 'flex',
        position: 'relative',
      }),
      highlight: css({
        Absolute: [0, 0, null, 0],
        height: 1,
        borderTop: `solid 1px ${color.format(1)}`,
        pointerEvents: 'none',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>{this.props.children}</div>
        <div {...styles.highlight} />
      </div>
    );
  }
}
