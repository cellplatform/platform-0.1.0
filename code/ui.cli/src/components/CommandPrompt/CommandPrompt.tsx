import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, debounceTime } from 'rxjs/operators';

import { GlamorValue, str, t, events } from '../../common';
import { CommandPromptInput } from '../CommandPromptInput';
import { ICommandPromptTheme } from './types';

export type ICommandPromptProps = {
  cli: t.ICommandState;
  theme?: ICommandPromptTheme | 'DARK';
  placeholder?: string;
  keyPress$?: events.KeypressObservable;
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
    // Setup observables.
    const cli$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    const keydown$ = (this.props.keyPress$ || events.keyPress$).pipe(
      takeUntil(this.unmounted$),
      filter(e => e.isPressed === true),
    );

    // Update state.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    cli$
      // Redraw on CLI changes.
      .pipe(debounceTime(0))
      .subscribe(e => this.forceUpdate());

    cli$
      // Handle invoke requests.
      .pipe(filter(e => e.invoked && !e.namespace))
      .subscribe(e => this.cli.invoke());

    console.log(`\nTODO 🐷   Take Key Commands from props \n`);

    keydown$
      // Focus on CMD+L
      .pipe(
        filter(e => e.key === 'l' && e.metaKey),
        filter(() => !this.isFocused),
      )
      .subscribe(e => {
        e.preventDefault();
        this.focus();
      });

    keydown$
      // Invoke on [Enter]
      .pipe(filter(e => e.key === 'Enter'))
      .subscribe(e => this.invoke());

    keydown$
      // Clear on CMD+K
      .pipe(
        filter(e => e.key === 'k' && e.metaKey),
        filter(e => this.isFocused),
      )
      .subscribe(e => {
        const clearNamespace = !Boolean(this.cli.text);
        this.clear({ clearNamespace });
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

  public get isFocused() {
    return this.input ? this.input.isFocused : false;
  }

  /**
   * [Methods]
   */
  public focus = () => {
    if (this.input) {
      this.input.focus();
    }
  };

  public clear = (args: { clearNamespace?: boolean } = {}) => {
    const namespace = args.clearNamespace ? false : undefined;
    this.fireChange({ text: '', namespace });
  };

  public invoke = () => {
    this.fireChange({ text: this.cli.text, invoked: true });
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
        keyPress$={this.props.keyPress$}
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

  private fireChange = (args: { text?: string; invoked?: boolean; namespace?: boolean }) => {
    const e = CommandPromptInput.toChangeArgs(args);
    this.cli.change(e);
  };
}
