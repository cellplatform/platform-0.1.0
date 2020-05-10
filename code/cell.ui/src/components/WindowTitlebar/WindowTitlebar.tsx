import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS } from '../../common';

export type IWindowTitlebarProps = {
  text?: string;
  style?: CssValue;
};
export type IWindowTitlebarState = {
  isFocused?: boolean;
};

export class WindowTitlebar extends React.PureComponent<
  IWindowTitlebarProps,
  IWindowTitlebarState
> {
  public state: IWindowTitlebarState = {};
  private state$ = new Subject<Partial<IWindowTitlebarState>>();
  private unmounted$ = new Subject<{}>();

  public static HEIGHT = 38;

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowTitlebarProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
   * [Methods]
   */

  private updateState = () => {
    const isFocused = document.hasFocus();
    this.state$.next({ isFocused });
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
        height: WindowTitlebar.HEIGHT,
        boxSizing: 'border-box',
        borderBottom: `solid 1px ${color.format(isFocused ? -0.2 : -0.08)}`,
        background: isFocused
          ? `linear-gradient(180deg, #E5E5E5 0%, #CDCDCD 100%)`
          : color.format(-0.03),
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
        backgroundColor: color.format(1),
        border: `solid 1px ${color.format(-0.2)}`,
        borderBottomColor: color.format(-0.26),
        borderRadius: 4,
        fontSize: 13,
        PaddingX: 100,
        height: 26,
        minWidth: 300,
        Flex: 'center-center',
        boxSizing: 'border-box',
        opacity: isFocused ? 1 : 0.35,
      }),
      label: css({
        opacity: 0.75,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.label}>{this.props.text || 'Untitled'}</div>
      </div>
    );
  }
}
