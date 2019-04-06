import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommandHelpList, CommandPrompt } from '../../src';
import { init as initCommandLine } from '../cli';
import { COLORS, css, GlamorValue, renderer, t } from '../common';

const cli = initCommandLine({});

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
   * [Properties]
   */
  private get cli() {
    return cli;
  }

  /**
   * [Render]
   */
  public render() {
    const cli = this.cli;
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
          <CommandPrompt ref={this.promptRef} cli={cli} events$={this.events$} />
        </div>
        <div {...styles.body}>
          <CommandHelpList cli={cli} onCommandClick={this.handleHelpClick} />
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
