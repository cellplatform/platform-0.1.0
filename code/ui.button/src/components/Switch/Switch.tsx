import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button } from '../Button';
import { css, defaultValue, GlamorValue, mouse, t } from '../common';
import { SwitchTheme } from './SwitchTheme';

export type ISwitchProps = mouse.IMouseEventProps & {
  isEnabled?: boolean;
  theme?: Partial<t.ISwitchTheme>;
  style?: GlamorValue;
};
export type ISwitchState = {
  isDown?: boolean;
  isOver?: boolean;
};

export class Switch extends React.PureComponent<ISwitchProps, ISwitchState> {
  /**
   * [Static]
   */
  public static theme = SwitchTheme;

  /**
   * [Fields]
   */
  public state: ISwitchState = {};
  private state$ = new Subject<Partial<ISwitchState>>();
  private unmounted$ = new Subject<{}>();
  private mouse: mouse.IMouseHandlers;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    this.mouse = Button.mouseState(this.props, this.state$, this.unmounted$, () => this.isEnabled);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isEnabled() {
    return defaultValue(this.props.isEnabled, true);
  }

  private get theme() {
    return SwitchTheme.BASE;
    // const { isOver, isDown } = this.state;
    // const { theme } = this.props;
    // const overTheme = defaultValue(this.props.overTheme, this.props.theme);
    // const downTheme = defaultValue(this.props.downTheme, overTheme);
    // const current = isDown ? downTheme : isOver ? overTheme : theme;
    // return SwitchTheme.merge(current || {});
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)} {...this.mouse.events}>
        <div>Switch: {this.state.isOver ? 'over' : 'no'}</div>
      </div>
    );
  }
}
