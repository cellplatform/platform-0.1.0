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
  public static THEMES = CommandPromptInput.THEMES;

  public state: ICommandPromptState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommandPromptState>>();
  private keyPress$ = (this.props.keyPress$ || events.keyPress$).pipe(takeUntil(this.unmounted$));

  private input: CommandPromptInput | undefined;
  private inputRef = (ref: CommandPromptInput) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Setup observables.
    const changed$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    const keydown$ = this.keyPress$.pipe(filter(e => e.isPressed === true));
    const tab$ = keydown$.pipe(
      filter(e => e.key === 'Tab'),
      filter(e => this.isFocused),
    );

    // Update state.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    changed$
      // Redraw on CLI changes.
      .pipe(debounceTime(0))
      .subscribe(e => this.forceUpdate());

    changed$
      // Handle invoke requests.
      .pipe(filter(e => e.invoked))
      .subscribe(e => this.cli.invoke());

    keydown$
      // Focus or blur on CMD+L
      .pipe(filter(e => e.key === 'l' && e.metaKey))
      .subscribe(e => {
        e.preventDefault();
        if (this.isFocused) {
          this.blur();
        } else {
          this.focus();
        }
      });

    keydown$
      // Invoke on [Enter]
      .pipe(filter(e => e.key === 'Enter'))
      .subscribe(e => this.invoke());

    keydown$
      // Clear on [CMD+K]
      .pipe(
        filter(e => e.key === 'k' && e.metaKey),
        filter(e => this.isFocused),
      )
      .subscribe(e => {
        const clearNamespace = !Boolean(this.cli.text);
        this.clear({ clearNamespace });
      });

    tab$
      // When [Tab] key pressed, keep focus on command-prompt.
      .subscribe(e => e.preventDefault());

    tab$
      // Autocomplete on [Tab]
      .pipe(filter(e => Boolean(this.cli.text)))
      .subscribe(e => this.autoComplete());
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

  public blur = () => {
    if (this.input) {
      this.input.blur();
    }
  };

  public clear = (args: { clearNamespace?: boolean } = {}) => {
    const namespace = args.clearNamespace ? false : undefined;
    this.fireChange({ text: '', namespace });
  };

  public invoke = () => {
    this.fireChange({ text: this.cli.text, invoked: true });
  };

  public autoComplete = () => {
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
        keyPress$={this.keyPress$}
        onChange={cli.change}
      />
    );
  }
}
