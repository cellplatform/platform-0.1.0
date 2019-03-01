import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { color, COLORS, css, GlamorValue, mouse, value } from './common';

export type IButtonProps = mouse.IMouseEventProps & {
  children?: React.ReactNode;
  label?: string;
  isActive?: boolean;
  style?: GlamorValue;
};

export type IButtonState = {
  isDown?: boolean;
};

export class Button extends React.PureComponent<IButtonProps, IButtonState> {
  public state: IButtonState = {};
  private mouse: mouse.IMouseHandlers;
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  constructor(props: IButtonProps) {
    super(props);
    this.mouse = mouse.fromProps(props, { force: ['DOWN', 'UP'] });
    const mouse$ = this.mouse.events$.pipe(
      takeUntil(this.unmounted$),
      filter(() => this.isActive),
    );

    mouse$.pipe(filter(e => e.type === 'DOWN')).subscribe(e => this.setState({ isDown: true }));
    mouse$.pipe(filter(e => e.type === 'UP')).subscribe(e => this.setState({ isDown: false }));
  }
  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get isActive() {
    return value.defaultValue(this.props.isActive, true);
  }

  /**
   * [Render]
   */
  public render() {
    const { isDown = false } = this.state;
    const isActive = this.isActive;
    const styles = {
      base: css({
        position: 'relative',
        display: 'inline-block',
        color: isActive && COLORS.BLUE,
        cursor: isActive && 'pointer',
        transform: isActive && `translateY(${isDown ? 1 : 0}px)`,
        userSelect: 'none',
        marginRight: 8,
      }),
    };

    const events = isActive ? this.mouse.events : {};

    return (
      <div {...css(styles.base, this.props.style)} {...events}>
        {this.props.label}
        {this.props.children}
      </div>
    );
  }
}
