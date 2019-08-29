import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { log, time, COLORS, css, GlamorValue, t } from '../common';
import { Splash } from '../Splash';

export type ILoadShellProps = {
  loader: t.ILoader;
  loadDelay?: number;
  theme?: t.LoaderTheme;
  splash?: t.SplashFactory;
  style?: GlamorValue;
};
export type ILoadShellState = {
  isLoaded?: boolean;
  el?: JSX.Element;
};

export class LoadShell extends React.PureComponent<ILoadShellProps, ILoadShellState> {
  public state: ILoadShellState = {};
  private state$ = new Subject<Partial<ILoadShellState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ILoadShellProps) {
    super(props);
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    const loader$ = this.loader.events$.pipe(takeUntil(this.unmounted$));

    loader$
      // Ensure the default module is loaded.
      .pipe(
        filter(e => e.type === 'LOADER/added'),
        filter(e => !this.state.isLoaded),
      )
      .subscribe(() => this.load(0));

    // Finish up.
    this.load(0);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get loader() {
    return this.props.loader;
  }

  public get theme() {
    const { theme = 'LIGHT' } = this.props;
    return theme;
  }

  public get isDark() {
    return this.theme === 'DARK';
  }

  /**
   * [Methods]
   */
  public async load(moduleId?: string | number) {
    const { loadDelay = 0 } = this.props;

    const loader = this.loader;
    if (this.state.isLoaded || loader.length === 0 || loader.isLoading(0)) {
      return;
    }

    // Load the default module.
    const res = await loader.load(moduleId || 0);
    this.state$.next({ isLoaded: true });

    // Update the UI.
    const el = res.result;
    if (React.isValidElement(el)) {
      time.delay(loadDelay, () => this.state$.next({ el }));
    } else {
      log.error(`LOADER: The default module did not render a JSX.Element`);
    }
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
      outer: css({
        Absolute: 0,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderBody()}
        {this.renderSplash()}
      </div>
    );
  }

  private renderSplash() {
    const SPEED = 0.5;
    const isVisible = !Boolean(this.state.el);
    const styles = {
      base: css({
        pointerEvents: isVisible ? 'auto' : 'none', // NB: click-through splash when not showing.
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${SPEED}s`,
      }),
    };
    return <Splash theme={this.theme} style={styles.base} factory={this.props.splash} />;
  }

  private renderBody() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
    };
    return <div {...styles.base}>{this.state.el}</div>;
  }
}
