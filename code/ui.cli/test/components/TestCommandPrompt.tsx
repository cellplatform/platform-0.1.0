import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommandHelpList, CommandPrompt, CommandTree } from '../../src';
import * as cli from '../cli';
import { COLORS, css, GlamorValue, renderer, t } from '../common';

export type ITestCommandPromptProps = { style?: GlamorValue };
export type ITestCommandPromptState = {};

export class TestCommandPrompt extends React.PureComponent<
  ITestCommandPromptProps,
  ITestCommandPromptState
> {
  public state: ITestCommandPromptState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCommandPromptState>>();
  private events$ = new Subject<t.CommandPromptEvent>();
  private cli = cli.init({});

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  private prompt!: CommandPrompt;
  private promptRef = (ref: CommandPrompt) => (this.prompt = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const cli$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));

    cli$.subscribe(e => {
      // console.log('🌳 EVENT', e);
    });

    const changed$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    changed$.subscribe(e => this.forceUpdate());

    // cli$.pipe(filter(e => e.invoked && !e.namespace)).subscribe(async e => {
    //   const { args } = e.props;
    //   const command = e.props.command as t.ICommand<t.ITestCommandProps>;
    //   this.cli.invoke({ command, args });
    // });

    this.events$.subscribe(e => {
      console.log('🌳', e.type, e.payload);
    });
  }

  public componentDidMount() {
    this.prompt.focus();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const cli = this.cli;
    const styles = {
      base: css({ flex: 1, Flex: 'vertical' }),
      prompt: css({
        backgroundColor: COLORS.DARK,
        padding: 5,
      }),
      body: css({
        padding: 20,
        Flex: 'horizontal-stretch-stretch',
        flex: 1,
      }),
      tree: css({
        flex: 1,
        display: 'flex',
      }),
    };

    /**
     * TODO
     * - turn <CommandTree> into <CommandTreeView>
     * - Make <CommandTree> take the `CommandState` object like `CommandHelpList` does.
     *    and manage changes internally.
     */
    const current = this.cli.namespace ? this.cli.namespace.command : undefined;

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.prompt}>
          <CommandPrompt ref={this.promptRef} cli={cli} events$={this.events$} />
        </div>
        <div {...styles.body}>
          <CommandHelpList cli={cli} onCommandClick={this.handleHelpClick} />
          <div {...styles.tree}>
            <CommandTree root={cli.root} current={current} theme={'LIGHT'} />
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private handleHelpClick = (e: t.CommandClickEvent) => {
    console.log('help click', e);
  };
}
