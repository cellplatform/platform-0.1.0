import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import {
  CommandChangeDispatcher,
  containsFocus,
  css,
  events,
  GlamorValue,
  ICommandChangeArgs,
  ICommandNamespace,
} from '../../common';
import { TextInput, TextInputChangeEvent } from '../primitives';
import { THEMES } from './themes';
import { ICommandPromptTheme } from './types';

const FONT_SIZE = 14;

export type ICommandPromptProps = {
  text?: string;
  namespace?: ICommandNamespace;
  theme?: ICommandPromptTheme | 'DARK';
  placeholder?: string;
  style?: GlamorValue;
  onChange?: CommandChangeDispatcher;
  onAutoComplete?: (e: {}) => void;
};
export type ICommandPromptState = {};

export class CommandPrompt extends React.PureComponent<ICommandPromptProps, ICommandPromptState> {
  public state: ICommandPromptState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<ICommandPromptState>();

  private elInput: TextInput | undefined;
  private elInputRef = (ref: TextInput) => (this.elInput = ref);

  /**
   * [Lifecycle]
   */

  constructor(props: ICommandPromptProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const keydown$ = events.keyPress$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.isPressed === true),
    );

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
      .subscribe(e => this.fireInvoke());

    keydown$
      // Clear on CMD+K
      .pipe(
        filter(e => e.key === 'k' && e.metaKey),
        filter(e => this.isFocused),
      )
      .subscribe(e => {
        const clearNamespace = !Boolean(this.text);
        this.clear({ clearNamespace });
      });

    const tab$ = keydown$.pipe(
      filter(e => e.key === 'Tab'),
      filter(() => this.isFocused),
    );
    tab$.subscribe(e => e.preventDefault());

    tab$
      // Fire auto-complete event.
      .pipe(filter(e => Boolean(this.text)))
      .subscribe(e => {
        const { onAutoComplete } = this.props;
        if (onAutoComplete) {
          onAutoComplete({});
        }
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get text() {
    return this.props.text || '';
  }

  public get isFocused() {
    return containsFocus(this);
  }

  private get theme() {
    const { theme = 'DARK' } = this.props;
    if (typeof theme === 'object') {
      return theme;
    }
    switch (theme) {
      case 'DARK':
        return THEMES.DARK;
    }
    throw new Error(`Theme '${theme}' not supported`);
  }

  /**
   * [Methods]
   */
  public focus = () => {
    if (this.elInput) {
      this.elInput.focus();
    }
  };

  public clear(args: { clearNamespace?: boolean } = {}) {
    const namespace = args.clearNamespace ? false : undefined;
    this.fireChange({ text: '', namespace });
  }

  /**
   * [Render]
   */

  public render() {
    const { placeholder = 'command', namespace } = this.props;
    const theme = this.theme;
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        flex: 1,
        height: 32,
        fontSize: FONT_SIZE,
        Flex: 'horizontal-center-start',
        paddingLeft: 10,
      }),
      namespace: css({
        color: theme.namespaceColor,
        marginRight: 4,
      }),
      prefix: css({
        color: theme.prefixColor,
        userSelect: 'none',
        marginRight: 5,
        fontWeight: 600,
      }),
      textbox: css({
        flex: 1,
      }),
    };

    const elNamespace = namespace && <div {...styles.namespace}>{namespace.toString()}</div>;

    return (
      <div {...css(styles.base, this.props.style)} onClick={this.focus}>
        {elNamespace}
        <div {...styles.prefix}>{'>'}</div>
        <TextInput
          ref={this.elInputRef}
          style={styles.textbox}
          onChange={this.handleChange}
          value={this.text}
          valueStyle={{ color: theme.color }}
          placeholder={placeholder}
          placeholderStyle={{ color: theme.placeholderColor }}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private fireChange(args: { text?: string; invoked?: boolean; namespace?: boolean }) {
    const { invoked, text = '', namespace } = args;
    const { onChange } = this.props;
    const e: ICommandChangeArgs = { text, invoked, namespace };
    if (onChange) {
      onChange(e);
    }
  }

  private fireInvoke = () => {
    this.fireChange({ text: this.text, invoked: true });
  };

  private handleChange = async (e: TextInputChangeEvent) => {
    this.fireChange({ text: e.to });
  };
}
