import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import {
  log,
  color,
  COLORS,
  CommandHelpList,
  CommandPrompt,
  CommandTree,
  css,
  renderer,
  t,
} from '../common';

export type ITestCommandPromptProps = {};

export class TestCommandPrompt extends React.PureComponent<ITestCommandPromptProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private events$ = new Subject<t.CommandPromptEvent>();
  private cli = cli.init({ state$: this.state$, getState: () => this.state });

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  private prompt!: CommandPrompt;
  private promptRef = (ref: CommandPrompt) => (this.prompt = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const cli$ = this.cli.events$.pipe(takeUntil(this.unmounted$));

    cli$.subscribe(e => {
      log.info('🌳', e.type, e.payload);
    });
  }

  public componentDidMount() {
    // Initial invoke to run any `root` handler that may have been specified.
    this.cli.invoke();
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
        padding: 40,
        Flex: 'horizontal-stretch-stretch',
        flex: 1,
      }),
      tree: css({
        flex: 1,
        display: 'flex',
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        borderRight: `solid 1px ${color.format(-0.1)}`,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.prompt}>
          <CommandPrompt ref={this.promptRef} cli={cli} keyMap={{ focus: 'CMD+SHIFT+L' }} />
        </div>
        <div {...styles.body}>
          <CommandHelpList cli={cli} onCommandClick={this.handleHelpClick} />
          <div {...styles.tree}>
            <CommandTree cli={cli} />
          </div>
        </div>
        <div {...styles.prompt}>
          <CommandPrompt ref={this.promptRef} cli={cli} events$={this.events$} focusOnLoad={true} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleHelpClick = (e: t.CommandClickEvent) => {
    log.info('help click', e);
  };
}
