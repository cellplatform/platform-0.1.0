import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button } from '../Button';
import { R, color, css, defaultValue, GlamorValue, mouse, t } from '../common';
import { SwitchTheme } from './SwitchTheme';

export type ISwitchProps = mouse.IMouseEventProps & {
  value?: boolean;
  width?: number;
  height?: number;
  isEnabled?: boolean;
  track?: Partial<t.ISwitchTrack>;
  theme?: t.SwitchThemeName | Partial<t.ISwitchTheme>;
  transitionSpeed?: number;
  style?: GlamorValue;
};
export type ISwitchState = {
  isDown?: boolean;
  isOver?: boolean;
  isLoaded?: boolean;
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

  public componentDidMount() {
    this.state$.next({ isLoaded: true });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get value() {
    return defaultValue(this.props.value, false);
  }

  public get isEnabled() {
    return defaultValue(this.props.isEnabled, true);
  }

  public get width() {
    // const width = this.props.width
    // return 50;
    const height = this.height;
    return defaultValue(this.props.width, height * 2 - height * 0.4);
  }

  public get height() {
    return defaultValue(this.props.height, 32);
  }

  public get transitionSpeed() {
    return defaultValue(this.props.transitionSpeed, 200);
  }

  private get theme() {
    let theme = this.props.theme || 'LIGHT';
    theme = typeof theme === 'string' ? SwitchTheme.fromString(theme as t.SwitchThemeName) : theme;
    return theme as t.ISwitchTheme;

    // const overTheme = defaultValue(this.props.overTheme, this.props.theme);
    // const downTheme = defaultValue(this.props.downTheme, overTheme);
    // const current = isDown ? downTheme : isOver ? overTheme : theme;
    // return SwitchTheme.merge(current || {});
  }

  public get track() {
    const theme = this.theme;
    const defaultTrack: t.ISwitchTrack = {
      heightOffset: 0,
      borderRadius: this.height / 2,
      color: theme.track.color,
    };
    const res = R.mergeDeepRight(defaultTrack, this.props.track || {}) as t.ISwitchTrack;
    return R.clone(res);
  }

  /**
   * [Render]
   */
  public render() {
    const width = this.width;
    const height = this.height;
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        display: 'inline-block',
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        width,
        height,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} {...this.mouse.events}>
        {this.renderTrack()}
      </div>
    );
  }

  private renderTrack() {
    const { isLoaded } = this.state;
    const value = this.value;
    const track = this.track;
    const x = 0;
    const y = track.heightOffset;
    const styles = {
      base: css({
        Absolute: [y, x, y, x],
        borderRadius: track.borderRadius,
        backgroundColor: color.format(value ? track.color.on : track.color.off),
        transition: isLoaded ? `background-color ${this.transitionSpeed}ms` : undefined,
      }),
    };
    return (
      <div {...styles.base}>
        <div />
      </div>
    );
  }
}
