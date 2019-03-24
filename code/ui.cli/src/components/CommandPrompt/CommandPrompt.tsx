import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, debounceTime } from 'rxjs/operators';

import { GlamorValue, str, t } from '../../common';
import { CommandPromptInput } from '../CommandPromptInput';
import { ICommandPromptTheme } from './types';

export type ICommandPromptProps = {
  cli: t.ICommandState;
  theme?: ICommandPromptTheme | 'DARK';
  placeholder?: string;
  style?: GlamorValue;
};
export type ICommandPromptState = {};

export class CommandPrompt extends React.PureComponent<ICommandPromptProps, ICommandPromptState> {
  public state: ICommandPromptState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommandPromptState>>();

  private input: CommandPromptInput | undefined;
  private inputRef = (ref: CommandPromptInput) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const cli$ = this.cli.change$.pipe(takeUntil(this.unmounted$));

    cli$.pipe(debounceTime(0)).subscribe(e => this.forceUpdate());

    cli$.pipe(filter(e => e.invoked && !e.namespace)).subscribe(async e => {
      const { args } = e.props;
      // const command = e.props.command;
      // this.cli.invoke({ command, args });
      console.log('INVOKE', args);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get cli() {
    return this.props.cli;
  }

  /**
   * [Methods]
   */
  public focus = () => {
    if (this.input) {
      this.input.focus();
    }
  };

  /**
   * [Render]
   */
  public render() {
    const { theme, placeholder, style } = this.props;
    const cli = this.cli;
    return (
      <CommandPromptInput
        ref={this.inputRef}
        style={style}
        theme={theme}
        placeholder={placeholder}
        text={cli.text}
        namespace={cli.namespace}
        onChange={cli.change}
        onAutoComplete={this.handleAutoComplete}
      />
    );
  }

  /**
   * [Handlers]
   */
  private handleAutoComplete = () => {
    const cli = this.cli;
    const root = cli.namespace ? cli.namespace.command : cli.root;
    const match = root.children.find(c => str.fuzzy.isMatch(cli.text, c.name));
    if (match) {
      cli.change({ text: match.name });
    }
  };
}
