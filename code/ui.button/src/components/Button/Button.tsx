import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, mouse, t, value, color } from '../../common';
import { ButtonTheme } from './ButtonTheme';

const defaultValue = value.defaultValue;

export type IButtonProps = mouse.IMouseEventProps & {
  id?: string;
  children?: React.ReactNode;
  label?: string;
  isEnabled?: boolean;
  block?: boolean;
  theme?: Partial<t.IButtonTheme>;
  overTheme?: Partial<t.IButtonTheme>;
  downTheme?: Partial<t.IButtonTheme>;
  margin?: string | number | Array<string | number | null>;
  minWidth?: number;
  style?: GlamorValue;
};

export type IButtonState = {
  isDown?: boolean;
  isOver?: boolean;
};

/**
 * A simple clickable button primitive.
 */
export class Button extends React.PureComponent<IButtonProps, IButtonState> {
  /**
   * [Static]
   */
  public static theme = ButtonTheme;

  /**
   * [Fields]
   */
  public state: IButtonState = {};
  private mouse: mouse.IMouseHandlers;
  private unmounted$ = new Subject();
  private state$ = new Subject<IButtonState>();

  /**
   * [Lifecycle]
   */
  constructor(props: IButtonProps) {
    super(props);
    this.mouse = mouse.fromProps(props, {
      force: ['DOWN', 'UP', 'ENTER', 'LEAVE'],
      getEnabled: () => this.isEnabled,
    });
    const mouse$ = this.mouse.events$.pipe(
      takeUntil(this.unmounted$),
      filter(() => this.isEnabled),
    );

    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    mouse$.pipe(filter(e => e.type === 'DOWN')).subscribe(e => this.state$.next({ isDown: true }));
    mouse$.pipe(filter(e => e.type === 'UP')).subscribe(e => this.state$.next({ isDown: false }));
    mouse$.pipe(filter(e => e.type === 'ENTER')).subscribe(e => this.state$.next({ isOver: true }));
    mouse$
      .pipe(filter(e => e.type === 'LEAVE'))
      .subscribe(e => this.state$.next({ isOver: false }));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get isEnabled() {
    return value.defaultValue(this.props.isEnabled, true);
  }

  private get theme() {
    const { isOver, isDown } = this.state;
    const { theme } = this.props;
    const overTheme = defaultValue(this.props.overTheme, this.props.theme);
    const downTheme = defaultValue(this.props.downTheme, overTheme);
    const current = isDown ? downTheme : isOver ? overTheme : theme;
    return ButtonTheme.merge(current || {});
  }

  /**
   * [Render]
   */
  public render() {
    const { block = false, minWidth } = this.props;
    const { isDown = false } = this.state;
    const isEnabled = this.isEnabled;

    const theme = this.theme;
    const { backgroundColor: bg } = theme;
    const backgroundColor = isEnabled ? bg.enabled : bg.disabled || bg.enabled;

    const styles = {
      base: css({
        ...css.toMargins(this.props.margin),
        boxSizing: 'border-box',
        position: 'relative',
        display: block ? 'block' : 'inline-block',
        color: color.format(
          isEnabled ? theme.color.enabled : theme.color.disabled || theme.color.enabled,
        ),
        backgroundColor: backgroundColor && color.format(backgroundColor),
        cursor: isEnabled && 'pointer',
        userSelect: 'none',
      }),
      inner: css({
        minWidth,
        Flex: 'center-center',
      }),
      border:
        theme.border.isVisible &&
        css({
          ...css.toPadding(theme.border.padding),
          border: `solid ${theme.border.thickness}px ${color.format(theme.border.color)}`,
          borderRadius: theme.border.radius,
        }),
      content: css({
        transform: isEnabled && `translateY(${isDown ? 1 : 0}px)`,
        opacity: isEnabled ? 1 : theme.disabledOpacity,
      }),
    };

    return (
      <div {...css(styles.base, styles.border, this.props.style)} {...this.mouse.events}>
        <div {...styles.inner}>
          <div {...styles.content}>
            {this.props.label}
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
