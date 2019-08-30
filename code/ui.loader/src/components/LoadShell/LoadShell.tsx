import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, debounceTime } from 'rxjs/operators';

import { log, time, COLORS, css, GlamorValue, t } from '../../common';
import { Splash } from '../Splash';
import { createProvider } from '../../context/Context';
import { createSplash } from '../../model';

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

  private splash = createSplash({ isVisible: false, isSpinning: true });
  private _provider: React.FunctionComponent;

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
    const splash$ = this.splash.changed$.pipe(takeUntil(this.unmounted$));

    // Redraw when splash API is changed.
    splash$.pipe(debounceTime(0)).subscribe(e => {
      this.forceUpdate();
    });

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
    this.splash.dispose();
  }

  /**
   * [Properties]
   */
  private get loader() {
    return this.props.loader;
  }

  private get theme() {
    const { theme = 'LIGHT' } = this.props;
    return theme;
  }

  private get isDark() {
    return this.theme === 'DARK';
  }

  private get isSplashVisible() {
    return !Boolean(this.state.el) || this.splash.isVisible;
  }

  private get Provider() {
    if (!this._provider) {
      const loader = this.loader;
      const splash = this.splash;
      const theme = this.theme;
      const ctx = loader.getContextProps();
      this._provider = createProvider({ loader, splash, theme, ctx });
    }
    return this._provider;
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
      time.delay(loadDelay, () => {
        this.splash.isSpinning = false;
        this.state$.next({ el });
      });
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
    };

    return (
      <div {...css(styles.base, this.props.style)} className={'loader'}>
        {this.renderBody()}
        {this.renderSplash()}
      </div>
    );
  }

  private renderSplash() {
    const isVisible = this.isSplashVisible;
    return (
      <Splash
        theme={this.theme}
        isSpinning={this.splash.isSpinning}
        opacity={isVisible ? 1 : 0}
        factory={this.props.splash}
        children={this.splash.el}
      />
    );
  }

  private renderBody() {
    const styles = {
      base: css({ Absolute: 0, Scroll: true }),
    };
    return (
      <this.Provider>
        <div {...styles.base} className={'loader-root'}>
          {this.state.el}
        </div>
      </this.Provider>
    );
  }
}
