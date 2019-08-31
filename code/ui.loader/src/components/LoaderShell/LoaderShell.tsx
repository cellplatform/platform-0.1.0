import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { COLORS, log, t, time, constants } from '../../common';
import { createProvider } from '../../context/Context';
import { splash } from '../../model';
import { Splash } from '../Splash';

export type ILoaderShellProps = {
  loader: t.ILoader;
  theme?: t.LoaderTheme;
  splash?: t.SplashFactory;
  defaultModule?: number | string;
  loadDelay?: number;
};
export type ILoaderShellState = {
  isLoaded?: boolean;
  el?: JSX.Element;
};

const { CSS } = constants;

export class LoaderShell extends React.PureComponent<ILoaderShellProps, ILoaderShellState> {
  public state: ILoaderShellState = {};
  private state$ = new Subject<Partial<ILoaderShellState>>();
  private unmounted$ = new Subject<{}>();

  private splash = splash.create({ isVisible: false, isSpinning: true });
  private _provider: React.FunctionComponent;

  /**
   * [Lifecycle]
   */
  constructor(props: ILoaderShellProps) {
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
      .subscribe(() => this.load(this.defaultModule));

    // Finish up.
    this.load(this.defaultModule);
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

  private get defaultModule() {
    const { defaultModule = 0 } = this.props;
    return defaultModule;
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
      this._provider = createProvider({
        ctx: { loader, splash, theme },
        props: {}, // NB: Extended props if necessary (not used).
      });
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
      base: {
        ...CSS.ABSOLUTE,
        backgroundColor: this.isDark ? COLORS.DARK : COLORS.WHITE,
        overflow: 'hidden',
      },
    };

    return (
      <div style={styles.base as any} className={'loader'}>
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
      base: {
        ...CSS.ABSOLUTE,
        ...CSS.SCROLL,
      },
    };
    return (
      <this.Provider>
        <div style={styles.base as any} className={'loader-root'}>
          {this.state.el}
        </div>
      </this.Provider>
    );
  }
}
