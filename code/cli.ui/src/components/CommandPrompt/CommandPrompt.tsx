import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';

import { events, GlamorValue, Keyboard, str, t, defaultValue } from '../../common';
import { CommandPromptInput } from '../CommandPromptInput';
import { History } from './History';
import { ICommandPromptTheme } from './types';

export type ICommandPromptProps = {
  id?: string;
  cli: t.ICommandState;
  localStorage?: boolean;
  theme?: ICommandPromptTheme | 'DARK';
  placeholder?: string;
  focusOnLoad?: boolean;
  fontSize?: number;
  fontFamily?: string;
  keyMap?: Partial<t.ICommandPromptKeyMap>;
  keyPress$?: events.KeypressObservable;
  events$?: Subject<t.CommandPromptEvent>;
  style?: GlamorValue;
};

export class CommandPrompt extends React.PureComponent<ICommandPromptProps> {
  /**
   * [Static]
   */
  public static THEMES = CommandPromptInput.THEMES;

  /**
   * [Fields]
   */
  private unmounted$ = new Subject<{}>();
  private keyPress$ = (this.props.keyPress$ || events.keyPress$).pipe(takeUntil(this.unmounted$));
  private _events$ = new Subject<t.CommandPromptEvent>();
  private events$ = this._events$.pipe(takeUntil(this.unmounted$));
  private history = new History({ id: this.props.id });

  private input: CommandPromptInput | undefined;
  private inputRef = (ref: CommandPromptInput) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public async componentWillMount() {
    const keyMap = this.keyMap;

    // Setup observables.
    const cli$ = this.cli.events$.pipe(takeUntil(this.unmounted$));
    const cliChanged$ = this.cli.changed$.pipe(takeUntil(this.unmounted$));
    const cliInvoked$ = cli$.pipe(
      filter(e => e.type === 'COMMAND_STATE/invoked'),
      map(e => e.payload as t.ICommandStateInvokeResponse),
    );

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

    // Initialise the last command-line value, and keep a store of it as it changes.
    if (this.props.localStorage) {
      const localStorage = this.history.localStorage;
      const text = localStorage.text;
      this.cli.change({ text });
      this.cli.invoke({ stepIntoNamespace: true });
      cli$.subscribe(e => {
        localStorage.text = this.cli.toString();
      });
    }

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
      .subscribe(e => {
        historyIndex = -1;
        this.cli.invoke();
      });

    cliInvoked$
      // Clear the text of a command after it is invoked.
      // NB:  This is the standard behavior of a CLI.
      //      Using the UP key can retrieve the last command from this history.
      .pipe(
        filter(e => !e.isNamespaceChanged),
        filter(e => Boolean((this.cli.text || '').trim())),
      )
      .subscribe(e => {
        if (this.props.localStorage) {
          this.history.add(this.cli.namespace, this.cli.text);
        }
        this.change({ text: '' });
      });

    keydown$
      // Focus or blur on CMD+L
      .pipe(filter(e => Keyboard.matchEvent(keyMap.focus, e)))
      .subscribe(e => {
        e.preventDefault();
        this.focus(!this.isFocused);
      });

    let historyIndex = -1;
    keydown$
      // History up ("back").
      .pipe(
        filter(e => this.isFocused),
        filter(e => Boolean(this.props.localStorage)),
        filter(e => Keyboard.matchEvent(keyMap.historyUp, e)),
      )
      .subscribe(e => {
        e.preventDefault();
        historyIndex++;
        const prev = this.history.get(historyIndex, this.cli.namespace);
        if (prev) {
          this.change({ text: prev.command });
        } else {
          historyIndex--; // NB: If outside the bounds of available history keep the nav index where it is.
        }
      });

    keydown$
      // History down ("next").
      .pipe(
        filter(e => this.isFocused),
        filter(e => Boolean(this.props.localStorage)),
        filter(e => Keyboard.matchEvent(keyMap.historyDown, e)),
      )
      .subscribe(e => {
        e.preventDefault();
        historyIndex = Math.max(-1, historyIndex - 1);

        if (historyIndex < 0) {
          this.change({ text: '' });
        } else {
          const prev = this.history.get(historyIndex, this.cli.namespace);
          if (prev) {
            this.change({ text: prev.command });
          }
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

  public componentDidMount() {
    if (this.props.focusOnLoad) {
      this.focus();
    }
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

  private get keyMap() {
    const { keyMap = {} } = this.props;
    return {
      focus: Keyboard.parse(keyMap.focus, 'CMD+J'),
      historyUp: Keyboard.parse(keyMap.historyUp, 'ArrowUp'),
      historyDown: Keyboard.parse(keyMap.historyDown, 'ArrowDown'),
    };
  }

  /**
   * [Methods]
   */
  public focus = (isFocused?: boolean) => {
    if (this.input) {
      if (defaultValue(isFocused, true)) {
        this.input.focus();
      } else {
        this.blur();
      }
    }
    return this;
  };

  public blur = () => {
    if (this.input) {
      this.input.blur();
    }
    return this;
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
    const { theme, placeholder, style, fontSize, fontFamily } = this.props;
    const cli = this.cli;
    return (
      <CommandPromptInput
        id={this.props.id}
        ref={this.inputRef}
        style={style}
        theme={theme}
        placeholder={placeholder}
        text={cli.text}
        fontSize={fontSize}
        fontFamily={fontFamily}
        namespace={cli.namespace}
        keyPress$={this.keyPress$}
        onChange={this.change}
      />
    );
  }
}
