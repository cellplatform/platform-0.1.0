import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, COLORS, util, t } from '../../common';

export type IWindowAddressProps = {
  address?: React.ReactNode;
  isWindowFocused?: boolean;
  style?: CssValue;
};
export type IWindowAddressState = { isFocused?: boolean };

export class WindowAddress extends React.PureComponent<IWindowAddressProps, IWindowAddressState> {
  public state: IWindowAddressState = {};
  private state$ = new Subject<Partial<IWindowAddressState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowAddressProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    document.addEventListener('paste', this.paste);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
    document.removeEventListener('paste', this.paste);
  }

  /**
   * [Properties]
   */
  public get isFocused() {
    return this.state.isFocused;
  }

  /**
   * [Methods]
   */
  private paste = (event: ClipboardEvent) => {
    if (this.isFocused) {
      const event$ = util.getEventBus<t.UiEvent>();
      event$.next({
        type: 'UI:WindowAddress/paste',
        payload: {
          event,
          get text() {
            return event.clipboardData?.getData('text') || '';
          },
        },
      });
    }
  };

  /**
   * [Render]
   */
  public render() {
    const { isWindowFocused } = this.props;
    const isFocused = this.isFocused;
    const styles = {
      base: css({
        position: 'relative',
        backgroundColor: color.format(1),
        border: `solid 1px ${color.format(-0.2)}`,
        borderBottomColor: isWindowFocused ? undefined : color.format(-0.26),
        borderRadius: 4,
        fontSize: 13,
        height: 26,
        minWidth: 300,
        boxSizing: 'border-box',
        opacity: isWindowFocused ? 1 : 0.35,
        color: color.format(-0.7),
        outline: 'none',
      }),
      body: css({
        Absolute: 0,
        Flex: 'center-center',
        PaddingX: 10,
        boxSizing: 'border-box',
      }),
      focusBorder: css({
        borderRadius: 4,
        Absolute: -2,
        border: `solid 2px ${color.format(COLORS.BLUE)}`,
      }),
    };

    return (
      <div
        {...styles.base}
        tabIndex={0}
        onFocus={this.focusHandler(true)}
        onBlur={this.focusHandler(false)}
      >
        <div {...styles.body}>{this.props.address}</div>
        {isFocused && <div {...styles.focusBorder} />}
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private focusHandler = (isFocused: boolean) => {
    return () => this.state$.next({ isFocused });
  };
}
