import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, css, color, GlamorValue, defaultValue, time, t } from '../common';
import { Spinner } from '@platform/ui.spinner';

export type ISplashProps = {
  theme?: t.LoaderTheme;
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
    return defaultValue(this.props.isSpinning, true);
  }

  private get factory() {
    return this.props.factory || NULL_FACTORY;
  }

  /**
   * [Render]
   */
  public render() {
    const isDark = this.isDark;
    const styles = {
      base: css({
        Absolute: 0,
        color: isDark ? COLORS.WHITE : COLORS.DARK,
        backgroundColor: isDark ? COLORS.DARK : COLORS.WHITE,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderCircle()}
        {this.renderSpinner()}
        {this.renderLogos()}
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
