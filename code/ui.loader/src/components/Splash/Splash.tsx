import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, css, color, GlamorValue, defaultValue, time } from '../../common';
import { Spinner } from '@platform/ui.spinner';

export type ISplashProps = {
  theme?: 'LIGHT' | 'DARK';
  isSpinning?: boolean;
  style?: GlamorValue;
};
export type ISplashState = {
  isLoaded?: boolean;
};

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
    time.delay(500, () => {
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
    return defaultValue(this.props.isSpinning, true);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: this.isDark ? COLORS.DARK : COLORS.WHITE,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderCircle()}
        {this.renderSpinner()}
      </div>
    );
  }

  private renderCircle() {
    const SPEED = '0.6s';
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
    const SPEED = '0.8s';
    const color = this.isDark ? 1 : -1;
    const { isLoaded } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        opacity: isLoaded && this.isSpinning ? 1 : 0,
        transition: `opacity ${SPEED}`,
      }),
    };
    return (
      <div {...styles.base}>
        <Spinner color={color} />
      </div>
    );
  }
}
