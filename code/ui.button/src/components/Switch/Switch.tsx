import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button } from '../Button';
import { color, css, defaultValue, GlamorValue, mouse, R, t } from '../common';
import { SwitchTheme } from './SwitchTheme';

export type ISwitchProps = mouse.IMouseEventProps & {
  value?: boolean;
  width?: number;
  height?: number;
  isEnabled?: boolean;
  track?: Partial<t.ISwitchTrack>;
  thumb?: Partial<t.ISwitchThumb>;
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
  }

  private get track() {
    const theme = this.theme;
    const track = this.props.track || {};

    const offset = {
      width: defaultValue(track.widthOffset, 0),
      height: defaultValue(track.heightOffset, 0),
    };

    const defaultTrack: t.ISwitchTrack = {
      widthOffset: offset.width,
      heightOffset: offset.height,
      color: theme.trackColor,
      borderRadius: this.height / 2,
      borderWidth: { on: undefined, off: undefined }, // NB: undefined === fill background
    };

    const res = R.mergeDeepRight(defaultTrack, track) as t.ISwitchTrack;
    return R.clone(res);
  }

  private get thumb() {
    const theme = this.theme;
    const thumb = this.props.thumb || {};

    const offset = {
      x: defaultValue(thumb.xOffset, 2),
      y: defaultValue(thumb.yOffset, 2),
    };

    const height = this.height - offset.y * 2;
    const width = height;

    const defaultThumb: t.ISwitchThumb = {
      width,
      height,
      xOffset: offset.x,
      yOffset: offset.y,
      color: theme.thumbColor,
      borderRadius: this.height / 2,
      shadow: { x: 0, y: 2, blur: 4, color: theme.shadowColor },
    };
    const res = R.mergeDeepRight(defaultThumb, thumb) as t.ISwitchThumb;
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
        width,
        height,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} {...this.mouse.events}>
        {this.renderTrack()}
        {this.renderThumb()}
      </div>
    );
  }

  private renderTrack() {
    const { isLoaded } = this.state;
    const track = this.track;
    const on = this.value;
    const x = track.widthOffset;
    const y = track.heightOffset;

    const themeColor = color.format(on ? track.color.on : track.color.off);
    const borderWidth = on ? track.borderWidth.on : track.borderWidth.off;
    const backgroundColor = borderWidth ? undefined : themeColor;

    const speed = `${this.transitionSpeed}ms`;
    const transition = `border-color ${speed}, background-color ${speed}`;

    const styles = {
      base: css({
        Absolute: [y, x, y, x],
        boxSizing: 'border-box',
        borderRadius: track.borderRadius,
        borderWidth,
        borderStyle: borderWidth ? 'solid' : undefined,
        borderColor: themeColor,
        backgroundColor,
        transition: isLoaded ? transition : undefined,
        overflow: 'hidden',
      }),
    };
    return <div {...styles.base} />;
  }

  private renderThumb() {
    const { isLoaded } = this.state;
    const thumb = this.thumb;
    const on = this.value;
    const themeColor = color.format(on ? thumb.color.on : thumb.color.off);

    const width = thumb.width;
    const height = thumb.height;

    const x = on ? this.width - (width + thumb.xOffset) : 0 + thumb.xOffset;
    const y = thumb.yOffset;

    const speed = `${this.transitionSpeed}ms`;
    const transition = `left ${speed}, background-color ${speed}`;

    const styles = {
      base: css({
        Absolute: [y, null, null, x],
        width,
        height,
        boxSizing: 'border-box',
        borderRadius: thumb.borderRadius,
        backgroundColor: themeColor,
        transition: isLoaded ? transition : undefined,
        boxShadow: SwitchTheme.toShadowCss(thumb.shadow),
      }),
    };
    return <div {...styles.base} />;
  }
}
