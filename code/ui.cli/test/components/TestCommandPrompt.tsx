import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { CommandHelp, CommandPrompt } from '../../src';
import { init } from '../cli';
import { COLORS, css, GlamorValue, renderer, t } from '../common';

const cli = init({});

export type ITestCommandPromptProps = { style?: GlamorValue };
export type ITestCommandPromptState = {};

export class TestCommandPrompt extends React.PureComponent<
  ITestCommandPromptProps,
  ITestCommandPromptState
> {
  public state: ITestCommandPromptState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCommandPromptState>>();

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  private prompt!: CommandPrompt;
  private promptRef = (ref: CommandPrompt) => (this.prompt = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const cli$ = this.cli.state.change$.pipe(takeUntil(this.unmounted$));

    cli$.subscribe(e => {
      // console.log('🌳 EVENT', e);
    });

    cli$.pipe(filter(e => e.invoked && !e.namespace)).subscribe(async e => {
      const { args } = e.props;
      const command = e.props.command as t.ICommand<t.ITestCommandProps>;
      this.cli.invoke({ command, args });
    });
  }

  public componentDidMount() {
    this.prompt.focus();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  private get cli() {
    return cli;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ flex: 1 }),
      prompt: css({
        backgroundColor: COLORS.DARK,
        padding: 5,
      }),
      body: css({ padding: 20 }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.prompt}>
          <CommandPrompt ref={this.promptRef} cli={this.cli.state} />
        </div>
        <div {...styles.body}>
          <CommandHelp cli={this.cli.state} onCommandClick={this.handleHelpClick} />
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
