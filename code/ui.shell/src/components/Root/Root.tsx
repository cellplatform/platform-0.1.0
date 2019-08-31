import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t, COLORS, loader, createProvider, Shell } from '../common';
import { Tree } from './components/Tree';
import { Body } from './components/Body';
import { Sidepanel } from './components/Sidepanel';

export type IRootProps = {
  shell: Shell;
  theme?: t.ShellTheme;
  style?: GlamorValue;
};
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = loader.Context;
  public context!: loader.ILoaderContext;
  private _provider: React.FunctionComponent;

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    document.body.style.overflow = 'hidden'; // Prevent browser rubber-band.

    // Load the default module.
    const shell = this.shell;
    if (shell.defaultModuleId) {
      shell.load(shell.defaultModuleId);
    }
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
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical-stretch-stretch',
        boxSizing: 'border-box',
      }),
    };
    return (
      <this.Provider>
        <div {...styles.base}>
          {this.renderColumns()}
          {this.renderFooterBar()}
        </div>
      </this.Provider>
    );
  }

  public renderColumns() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
      }),
      left: css({
        width: 250,
        position: 'relative',
        backgroundColor: COLORS.DARK,
      }),
      middle: css({
        flex: 1,
        position: 'relative',
        backgroundColor: COLORS.WHITE,
      }),
      right: css({
        width: 300,
        position: 'relative',
        backgroundColor: COLORS.DARK,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          <Tree />
        </div>
        <div {...styles.middle}>
          <Body />
        </div>
        <div {...styles.right}>
          <Sidepanel />
        </div>
      </div>
    );
  }

  public renderFooterBar() {
    const styles = {
      base: css({
        boxSizing: 'border-box',
        backgroundColor: COLORS.DARK,
        borderTop: `solid 1px ${color.format(0.1)}`,
        height: 28,
      }),
    };
    return (
      <div {...styles.base}>
        <div />
      </div>
    );
  }
}
