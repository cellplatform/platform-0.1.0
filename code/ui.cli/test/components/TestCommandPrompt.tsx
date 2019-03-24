import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { CommandPrompt, CommandPromptInput, Help } from '../../src';
import { init } from '../cli';
import { COLORS, css, GlamorValue, str, t, renderer } from '../common';

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

  private promptInput: CommandPromptInput | undefined;
  private promptInputRef = (ref: CommandPromptInput) => (this.promptInput = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const cli$ = this.cli.state.change$.pipe(takeUntil(this.unmounted$));

    cli$.subscribe(e => {
      // console.log('🌳 EVENT', e);
    });

    cli$.pipe(debounceTime(0)).subscribe(e => this.forceUpdate());

    cli$.pipe(filter(e => e.invoked && !e.namespace)).subscribe(async e => {
      const { args } = e.props;
      const command = e.props.command as t.ICommand<t.ITestCommandProps>;
      this.cli.invoke({ command, args });
    });
  }

  public componentDidMount() {
    this.focus();
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
   * [Methods]
   */
  private focus = () => {
    if (this.promptInput) {
      this.promptInput.focus();
    }
  };

  /**
   * [Render]
   */
  public render() {
    const cli = this.cli;

    const styles = {
      base: css({
        flex: 1,
      }),
      prompt: css({
        backgroundColor: COLORS.DARK,
        padding: 5,
      }),
      body: css({
        padding: 20,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.prompt}>
          <CommandPromptInput
            ref={this.promptInputRef}
            text={cli.state.text}
            namespace={cli.state.namespace}
            onChange={cli.state.change}
            onAutoComplete={this.handleAutoComplete}
          />
        </div>
        <div {...styles.prompt}>
          <CommandPrompt ref={this.promptRef} cli={this.cli.state} />
        </div>
        <div {...styles.body}>
          <Help cli={this.cli.state} onCommandClick={this.handleHelpClick} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleAutoComplete = () => {
    const cli = this.cli.state;
    const root = cli.namespace ? cli.namespace.command : cli.root;
    const match = root.children.find(c => str.fuzzy.isMatch(cli.text, c.name));
    if (match) {
      cli.change({ text: match.name });
    }
  };

  private handleHelpClick = (e: t.CommandClickEvent) => {
    console.log('help click', e);
  };
}
