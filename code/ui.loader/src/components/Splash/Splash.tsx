import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, color, defaultValue, time, t, constants } from '../../common';
import { Spinner } from '@platform/ui.spinner';

export type ISplashProps = {
  children?: React.ReactNode;
  theme?: t.LoaderTheme;
  opacity?: number;
  isSpinning?: boolean;
  factory?: t.SplashFactory;
};
export type ISplashState = {
  isLoaded?: boolean;
};

const NULL_FACTORY: t.SplashFactory = args => undefined;
const { CSS } = constants;

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
      base: {
        ...CSS.ABSOLUTE,
        color: isDark ? COLORS.WHITE : COLORS.DARK,
        backgroundColor: isDark ? COLORS.DARK : COLORS.WHITE,
        opacity,
        transition: `opacity 200ms`,
        transitionTimingFunction: isVisible ? 'ease-in' : 'ease-out',
        pointerEvents: isVisible ? 'auto' : 'none', // NB: click-through splash when not showing.
      },
    };
    return (
      <div style={styles.base as any} className={'loader-splash'}>
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
      base: {
        ...CSS.ABSOLUTE,
        ...CSS.FLEX.CENTER,
      },
      circle: {
        width: size,
        height: size,
        backgroundColor: color.format(this.isDark ? 0.2 : -0.15),
        borderRadius: '50%',
        transform: `scale(${isLoaded ? 8 : 1})`,
        opacity: isLoaded ? 0 : 1,
        transition: `transform ${SPEED}, opacity ${SPEED}`,
      },
    };

    return (
      <div style={styles.base as any}>
        <div style={styles.circle} />
      </div>
    );
  }

  private renderSpinner() {
    const SPEED = '0.6s';
    const color = this.isDark ? 1 : -1;
    const { isLoaded } = this.state;
    const styles = {
      base: {
        ...CSS.ABSOLUTE,
        ...CSS.FLEX.CENTER,
        transform: `scale(${isLoaded ? 1 : 0.2})`,
        opacity: isLoaded && this.isSpinning ? 1 : 0,
        transition: `transform ${SPEED}, opacity ${SPEED}`,
      },
    };
    return (
      <div style={styles.base as any}>
        <Spinner color={color} />
      </div>
    );
  }

  private renderChildren() {
    const { children } = this.props;
    const hasChildren = Boolean(children);
    const isVisible = this.isVisible;

    const styles = {
      base: {
        ...CSS.ABSOLUTE,
        ...CSS.FLEX.CENTER,
        opacity: hasChildren ? 1 : 0,
        transform: `scale(${isVisible ? 1 : 1.2})`,
        transition: `opacity 600ms, transform 200ms`,
        transitionTimingFunction: isVisible ? 'ease-in' : 'ease-out',
      },
      inner: { position: 'relative' },
    };
    return (
      <div style={styles.base as any}>
        <div style={styles.inner as any}>{children}</div>
      </div>
    );
  }

  private renderLogos() {
    if (!this.props.factory) {
      return null;
    }
    const factory = this.factory;
    const styles = {
      base: { ...CSS.ABSOLUTE },
      topLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
      topRight: {
        position: 'absolute',
        top: 0,
        right: 0,
      },
      bottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
      },
      bottomRight: {
        position: 'absolute',
        right: 0,
        bottom: 0,
      },
    };
    const theme = this.theme;
    const args = { theme };
    return (
      <div {...styles.base}>
        <div style={styles.topLeft as any}>{factory({ ...args, type: 'TOP:LEFT' })}</div>
        <div style={styles.topRight as any}>{factory({ ...args, type: 'TOP:RIGHT' })}</div>
        <div style={styles.bottomLeft as any}>{factory({ ...args, type: 'BOTTOM:LEFT' })}</div>
        <div style={styles.bottomRight as any}>{factory({ ...args, type: 'BOTTOM:RIGHT' })}</div>
      </div>
    );
  }
}
