import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { events, GlamorValue, str, t } from '../../common';
import { CommandPromptInput } from '../CommandPromptInput';
import { ICommandPromptTheme } from './types';

export type ICommandPromptProps = {
  cli: t.ICommandState;
  theme?: ICommandPromptTheme | 'DARK';
  placeholder?: string;
  keyPress$?: events.KeypressObservable;
  events$?: Subject<t.CommandPromptEvent>;
  style?: GlamorValue;
};
export type ICommandPromptState = {};

export class CommandPrompt extends React.PureComponent<ICommandPromptProps, ICommandPromptState> {
  public static THEMES = CommandPromptInput.THEMES;

  public state: ICommandPromptState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommandPromptState>>();
  private keyPress$ = (this.props.keyPress$ || events.keyPress$).pipe(takeUntil(this.unmounted$));
  private _events$ = new Subject<t.CommandPromptEvent>();
  public events$ = this._events$.pipe(takeUntil(this.unmounted$));

  private input: CommandPromptInput | undefined;
  private inputRef = (ref: CommandPromptInput) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Setup observables.
    const cli$ = this.cli.events$.pipe(takeUntil(this.unmounted$));
    const cliChanged$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    const keydown$ = this.keyPress$.pipe(filter(e => e.isPressed === true));
    const tab$ = keydown$.pipe(
      filter(e => e.key === 'Tab'),
      filter(e => this.isFocused),
    );

    // Bubble events.
    cli$.subscribe(this._events$);
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Update state.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    cliChanged$
      // Redraw on CLI changes.
      .pipe(debounceTime(0))
      .subscribe(e => this.forceUpdate());

    cliChanged$
      // Handle invoke requests.
      .pipe(
        filter(e => e.invoke),
        filter(e => this.isFocused),
      )
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
      .pipe(
        filter(e => e.key === 'Enter'),
        filter(e => this.isFocused),
      )
      .subscribe(e => this.invoke());

    keydown$
      // Clear on [CMD+K]
      .pipe(
        filter(e => e.key === 'k' && e.metaKey),
        filter(e => this.isFocused),
      )
      .subscribe(e => {
        const text = this.cli.text;
        if (text.trim()) {
          this.change({ text: '' });
        } else {
          this.change({ namespace: 'PARENT', invoke: true });
        }
      });

    tab$
      // When [Tab] key pressed, keep focus on command-prompt.
      .subscribe(e => e.preventDefault());

    tab$
      // Autocomplete on [Tab]
      .pipe(filter(e => Boolean(this.cli.text)))
      .subscribe(e => {
        // Look for a previous autocomplete value to see if we need
        // to toggle through possible matches if that tab-key is
        // being repeatedly pressed.
        const prev = this.cli.autoCompleted;
        const text = prev ? prev.text.from : this.cli.text;
        const index = prev ? prev.index + 1 : 0;
        this.autoComplete(text, index);
        if (this.cli.autoCompleted) {
          this.fire({
            type: 'COMMAND_PROMPT/autoCompleted',
            payload: this.cli.autoCompleted,
          });
        }
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

  public blur = () => {
    if (this.input) {
      this.input.blur();
    }
  };

  public invoke = () => {
    this.change({ text: this.cli.text, invoke: true });
  };

  public autoComplete = (text: string, index?: number): t.ICommandAutoCompleted | undefined => {
    const cli = this.cli;
    const root = cli.namespace ? cli.namespace.command : cli.root;

    const matches = root.children.filter(child => str.fuzzy.isMatch(text, child.name));
    if (matches.length === 0) {
      return;
    }

    index = index === undefined ? 0 : index;
    index = index > matches.length - 1 ? 0 : index;
    const to = matches[index];
    if (!to) {
      return;
    }

    const autoCompleted: t.ICommandAutoCompleted = {
      index,
      text: { from: text, to: to.name },
      matches,
    };
    this.change({ text: to.name, autoCompleted });

    return autoCompleted;
  };

  private change = (e: t.ICommandChange) => {
    this.cli.change(e);
  };

  private fire(e: t.CommandPromptEvent) {
    this._events$.next(e);
  }

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
        onChange={this.change}
      />
    );
  }
}
