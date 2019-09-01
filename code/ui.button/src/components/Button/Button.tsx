import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { color, css, defaultValue, GlamorValue, mouse, t } from '../common';
import { ButtonTheme } from './ButtonTheme';

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
  tooltip?: string;
  events$?: Subject<t.ButtonEvent>;
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

  public static mouseState(
    props: mouse.IMouseEventProps,
    state$: Subject<{ isDown?: boolean; isOver?: boolean }>,
    unmounted$: Observable<{}>,
    getEnabled: () => boolean,
  ) {
    const res = mouse.fromProps(props, {
      force: true,
      getEnabled,
    });

    const mouse$ = res.events$.pipe(
      takeUntil(unmounted$),
      filter(() => getEnabled()),
    );

    mouse$.pipe(filter(e => e.type === 'DOWN')).subscribe(e => state$.next({ isDown: true }));
    mouse$.pipe(filter(e => e.type === 'UP')).subscribe(e => state$.next({ isDown: false }));
    mouse$.pipe(filter(e => e.type === 'ENTER')).subscribe(e => state$.next({ isOver: true }));
    mouse$.pipe(filter(e => e.type === 'LEAVE')).subscribe(e => state$.next({ isOver: false }));

    return res;
  }

  /**
   * [Fields]
   */
  public state: IButtonState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<IButtonState>();
  private events$ = new Subject<t.ButtonEvent>();
  private mouse: mouse.IMouseHandlers;

  /**
   * [Lifecycle]
   */
  constructor(props: IButtonProps) {
    super(props);

    // Setup observables.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    // Bubble events through given observable.
    if (this.props.events$) {
      events$.subscribe(this.props.events$);
    }

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Setup mouse.
    this.mouse = Button.mouseState(this.props, this.state$, this.unmounted$, () => this.isEnabled);
    const mouse$ = this.mouse.events$.pipe(takeUntil(this.unmounted$));
    mouse$.subscribe(e => this.fire({ type: 'BUTTON/mouse', payload: { ...e, id: this.id } }));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get id() {
    return this.props.id || '';
  }

  public get isEnabled() {
    return defaultValue(this.props.isEnabled, true);
  }

  private get theme() {
    const { isOver, isDown } = this.state;
    const { theme } = this.props;
    const overTheme = defaultValue(this.props.overTheme, this.props.theme);
    const downTheme = defaultValue(this.props.downTheme, overTheme);
    const current = isDown ? downTheme : isOver ? overTheme : theme;
    return ButtonTheme.merge(ButtonTheme.BASE, current || {});
  }

  /**
   * [Methods]
   */
  private fire(e: t.ButtonEvent) {
    this.events$.next(e);
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
        backgroundColor: backgroundColor ? color.format(backgroundColor) : undefined,
        cursor: isEnabled ? 'pointer' : undefined,
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
        transform: isEnabled ? `translateY(${isDown ? 1 : 0}px)` : undefined,
        opacity: isEnabled ? 1 : theme.disabledOpacity,
      }),
    };

    return (
      <div
        {...css(styles.base, styles.border, this.props.style)}
        {...this.mouse.events}
        title={this.props.tooltip}
      >
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
