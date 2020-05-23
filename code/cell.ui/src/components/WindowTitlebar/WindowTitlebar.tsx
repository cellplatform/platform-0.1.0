import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS, defaultValue } from '../../common';

export type IWindowTitleBarProps = {
  address?: React.ReactNode;
  height?: number;
  style?: CssValue;
};
export type IWindowTitleBarState = {
  isFocused?: boolean;
};

export class WindowTitleBar extends React.PureComponent<
  IWindowTitleBarProps,
  IWindowTitleBarState
> {
  public state: IWindowTitleBarState = {};
  private state$ = new Subject<Partial<IWindowTitleBarState>>();
  private unmounted$ = new Subject<{}>();

  public static HEIGHT = 38;
  public static GRADIENT = `linear-gradient(180deg, #E5E5E5 0%, #CDCDCD 100%)`;

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowTitleBarProps) {
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
        Flex: 'center-center',
        WebkitAppRegion: 'drag',
        position: 'relative',
        height: WindowTitleBar.HEIGHT,
        boxSizing: 'border-box',
        borderBottom: `solid 1px ${color.format(isFocused ? -0.2 : -0.08)}`,
        background: isFocused ? WindowTitleBar.GRADIENT : color.format(-0.03),
        userSelect: 'none',
        color: COLORS.DARK,
      }),
    };
    return <div {...css(styles.base, this.props.style)}>{this.renderAddressPanel()}</div>;
  }

  private renderAddressPanel() {
    const { isFocused } = this.state;
    const styles = {
      base: css({
        Flex: 'center-center',
        position: 'relative',
        backgroundColor: color.format(1),
        border: `solid 1px ${color.format(-0.2)}`,
        borderBottomColor: color.format(-0.26),
        borderRadius: 4,
        fontSize: 13,
        PaddingX: 100,
        height: 26,
        minWidth: 300,
        boxSizing: 'border-box',
        opacity: isFocused ? 1 : 0.35,
        color: color.format(-0.7),
      }),
    };

    return <div {...styles.base}>{this.props.address || 'Untitled'}</div>;
  }
}
