import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  color as colorUtil,
  COLORS,
  Command,
  CommandState,
  css,
  GlamorValue,
  t,
  value,
} from '../../common';
import { CommandPrompt } from '../CommandPrompt';
import { CommandTree, ICommandTreeProps } from '../CommandTree';

export type ICommandShellProps = {
  children?: React.ReactNode;
  cli: t.ICommandState;
  tree?: t.ICommandShellTreeOptions;
  localStorage?: boolean;
  focusOnLoad?: boolean;
  style?: GlamorValue;
};
export type ICommandShellState = {};

export class CommandShell extends React.PureComponent<ICommandShellProps, ICommandShellState> {
  /**
   * [State]
   */
  public static CommandState = CommandState;
  public static Command = Command;

  /**
   * [Fields]
   */

  public state: ICommandShellState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommandShellState>>();
  private tree$ = new Subject<t.CommandTreeEvent>();

  private prompt!: CommandPrompt;
  private promptRef = (ref: CommandPrompt) => (this.prompt = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Setup observables.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    // const cli$ = this.cli.events$.pipe(takeUntil(this.unmounted$));
    // const tree$ = this.tree$.pipe(takeUntil(this.unmounted$));

    // Update state.
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get cli() {
    return this.props.cli;
  }

  private get background() {
    const { tree = {} } = this.props;
    const level = value.defaultValue(tree.background, -0.02);
    const color = colorUtil.format(level);
    const isDark = level <= -0.4;
    const theme: ICommandTreeProps['theme'] = isDark ? 'DARK' : 'LIGHT';
    return { color, isDark, theme };
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.prompt) {
      this.prompt.focus();
    }
    return this;
  }

  /**
   * [Render]
   */
  public render() {
    const { tree } = this.props;
    const focusOnLoad = value.defaultValue(this.props.focusOnLoad, true);
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical',
      }),
      main: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
      body: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
      footer: css({
        backgroundColor: COLORS.DARK,
        height: 32,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.main}>
          {tree && this.renderTreeIndex()}
          <div {...styles.body}>{this.props.children}</div>
        </div>
        <div {...styles.footer}>
          <CommandPrompt
            ref={this.promptRef}
            cli={this.cli}
            theme={'DARK'}
            focusOnLoad={focusOnLoad}
            localStorage={this.props.localStorage}
          />
        </div>
      </div>
    );
  }

  private renderTreeIndex() {
    const { tree = {} } = this.props;
    const background = this.background;

    const styles = {
      base: css({
        position: 'relative',
        width: value.defaultValue(tree.width, 200),
        borderRight: `solid 1px ${colorUtil.format(-0.1)}`,
      }),
      bg: css({
        Absolute: 0,
        backgroundColor: background.color,
        borderBottom: background.isDark ? `solid 1px ${colorUtil.format(0.2)}` : undefined,
      }),
      tree: css({
        Absolute: 0,
        display: 'flex',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.bg} />
        <div {...styles.tree}>
          <CommandTree
            cli={this.cli}
            events$={this.tree$}
            background={'NONE'}
            theme={background.theme}
          />
        </div>
      </div>
    );
  }
}
