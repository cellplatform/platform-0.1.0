import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, css, color, GlamorValue, defaultValue, time, t } from '../../common';
import { Spinner } from '@platform/ui.spinner';

export type ISplashProps = {
  children?: React.ReactNode;
  theme?: t.LoaderTheme;
  opacity?: number;
  isSpinning?: boolean;
  factory?: t.SplashFactory;
  style?: GlamorValue;
};
export type ISplashState = {
  isLoaded?: boolean;
};

const NULL_FACTORY: t.SplashFactory = args => undefined;

export class Splash extends React.PureComponent<ISplashProps, ISplashState> {
  public state: ISplashState = { isLoaded: false };
  private state$ = new Subject<Partial<ISplashState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ISplashProps) {
    super(props);
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    time.delay(0, () => {
      this.state$.next({ isLoaded: true });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get theme() {
    const { theme = 'LIGHT' } = this.props;
    return theme;
  }

  public get isDark() {
    return this.theme === 'DARK';
  }

  public get isSpinning() {
    const { children } = this.props;
    return children ? false : defaultValue(this.props.isSpinning, true);
  }

  public get opacity() {
    const { opacity = 1 } = this.props;
    return opacity;
  }

  public get isVisible() {
    return this.opacity > 0;
  }

  private get factory() {
    return this.props.factory || NULL_FACTORY;
  }

  /**
   * [Render]
   */
  public render() {
    const opacity = this.opacity;
    const isVisible = this.isVisible;
    const isDark = this.isDark;
    const styles = {
      base: css({
        Absolute: 0,
        color: isDark ? COLORS.WHITE : COLORS.DARK,
        backgroundColor: isDark ? COLORS.DARK : COLORS.WHITE,
        opacity,
        transition: `opacity 200ms`,
        transitionTimingFunction: isVisible ? 'ease-in' : 'ease-out',
        pointerEvents: isVisible ? 'auto' : 'none', // NB: click-through splash when not showing.
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} className={'loader-splash'}>
        {this.renderCircle()}
        {this.renderSpinner()}
        {this.renderLogos()}
        {this.renderChildren()}
      </div>
    );
  }

  private renderCircle() {
    const SPEED = '0.8s';
    const { isLoaded } = this.state;
    const size = 14;
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      circle: css({
        width: size,
        height: size,
        backgroundColor: color.format(this.isDark ? 0.2 : -0.15),
        borderRadius: '50%',
        transform: `scale(${isLoaded ? 8 : 1})`,
        opacity: isLoaded ? 0 : 1,
        transition: `transform ${SPEED}, opacity ${SPEED}`,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.circle} />
      </div>
    );
  }

  private renderSpinner() {
    const SPEED = '0.6s';
    const color = this.isDark ? 1 : -1;
    const { isLoaded } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        transform: `scale(${isLoaded ? 1 : 0.2})`,
        opacity: isLoaded && this.isSpinning ? 1 : 0,
        transition: `transform ${SPEED}, opacity ${SPEED}`,
      }),
    };
    return (
      <div {...styles.base}>
        <Spinner color={color} />
      </div>
    );
  }

  private renderChildren() {
    const { children } = this.props;
    const hasChildren = Boolean(children);
    const isVisible = this.isVisible;

    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        opacity: hasChildren ? 1 : 0,
        transform: `scale(${isVisible ? 1 : 1.2})`,
        transition: `opacity 600ms, transform 200ms`,
        transitionTimingFunction: isVisible ? 'ease-in' : 'ease-out',
      }),
      inner: css({ position: 'relative' }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.inner}>{children}</div>
      </div>
    );
  }

  private renderLogos() {
    if (!this.props.factory) {
      return null;
    }
    const factory = this.factory;
    const styles = {
      base: css({ Absolute: 0 }),
      topLeft: css({ Absolute: [0, null, null, 0] }),
      topRight: css({ Absolute: [0, 0, null, null] }),
      bottomLeft: css({ Absolute: [null, null, 0, 0] }),
      bottomRight: css({ Absolute: [null, 0, 0, null] }),
    };
    const theme = this.theme;
    const args = { theme };
    return (
      <div {...styles.base}>
        <div {...styles.topLeft}>{factory({ ...args, type: 'TOP_LEFT' })}</div>
        <div {...styles.topRight}>{factory({ ...args, type: 'TOP_RIGHT' })}</div>
        <div {...styles.bottomLeft}>{factory({ ...args, type: 'BOTTOM_LEFT' })}</div>
        <div {...styles.bottomRight}>{factory({ ...args, type: 'BOTTOM_RIGHT' })}</div>
      </div>
    );
  }
}
