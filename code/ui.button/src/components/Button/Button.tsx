import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, mouse, t, value } from '../../common';
import { ButtonTheme } from './ButtonTheme';

export type IButtonProps = mouse.IMouseEventProps & {
  id?: string;
  children?: React.ReactNode;
  label?: string;
  isEnabled?: boolean;
  block?: boolean;
  theme?: Partial<t.IButtonTheme>;
  margin?: string | number | Array<string | number | null>;
  style?: GlamorValue;
};

export type IButtonState = {
  isDown?: boolean;
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
      force: ['DOWN', 'UP'],
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
    return ButtonTheme.merge(this.props.theme);
  }

  /**
   * [Render]
   */
  public render() {
    const { block = false } = this.props;
    const { isDown = false } = this.state;
    const isEnabled = this.isEnabled;
    const theme = this.theme;

    const styles = {
      base: css({
        ...css.toMargins(this.props.margin),
        boxSizing: 'border-box',
        position: 'relative',
        display: block ? 'block' : 'inline-block',
        color: isEnabled ? theme.enabledColor : theme.disabledColor,
        cursor: isEnabled && 'pointer',
        userSelect: 'none',
      }),
      border:
        theme.border.isVisible &&
        css({
          ...css.toPadding(theme.border.padding),
          border: `solid ${theme.border.thickness}px ${theme.border.color}`,
          borderRadius: theme.border.radius,
        }),
      content: css({
        transform: isEnabled && `translateY(${isDown ? 1 : 0}px)`,
        opacity: isEnabled ? 1 : theme.disabledOpacity,
      }),
    };

    return (
      <div {...css(styles.base, styles.border, this.props.style)} {...this.mouse.events}>
        <div {...styles.content}>
          {this.props.label}
          {this.props.children}
        </div>
      </div>
    );
  }
}
