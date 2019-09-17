import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { createProvider, css, GlamorValue, loader, Shell, t } from '../common';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Progress } from '../Progress';
import { RootColumns } from './Root.Columns';

export type IRootProps = {
  shell: Shell;
  style?: GlamorValue;
};
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();
  private tree$ = new Subject<t.TreeViewEvent>();

  public static contextType = loader.Context;
  public context!: loader.ILoaderContext;
  private _provider: React.FunctionComponent;

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);

    const tree$ = this.tree$.pipe(takeUntil(this.unmounted$));
    tree$.subscribe(e => this.shell.fire(e));
  }

  public componentDidMount() {
    document.body.style.overflow = 'hidden'; // Prevent browser rubber-band.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.load(this.shell.defaultModule);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get shell() {
    return this.props.shell;
  }

  private get model() {
    return this.shell.state;
  }

  private get Provider() {
    if (!this._provider) {
      const shell = this.shell;
      this._provider = createProvider({
        ctx: { shell },
        props: {}, // NB: Extended props if necessary (not used).
      });
    }
    return this._provider;
  }

  /**
   * [Methods]
   */
  public async load(moduleId?: string) {
    const shell = this.shell;
    if (moduleId) {
      const res = await shell.load(moduleId);
      if (res.ok) {
        this.context.splash.isVisible = false;
      } else {
        // TEMP 🐷 TODO: Show status somehow (in splash) that the load failed.
      }
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical-stretch-stretch',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }),
      progress: css({
        Absolute: [0, 0, null, 0],
        zIndex: 9999,
      }),
    };
    return (
      <this.Provider>
        <div {...styles.base}>
          <Header />
          <RootColumns tree$={this.tree$} />
          <Footer />
          <Progress style={styles.progress} />
        </div>
      </this.Provider>
    );
  }
}
