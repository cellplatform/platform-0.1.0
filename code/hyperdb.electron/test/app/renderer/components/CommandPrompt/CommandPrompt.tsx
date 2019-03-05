import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import {
  color,
  COLORS,
  CommandChangeDispatcher,
  constants,
  containsFocus,
  css,
  events,
  GlamorValue,
  ICommandChangeArgs,
} from '../../common';
import { TextInput, TextInputChangeEvent } from '../primitives';
import { ICommandPromptTheme } from './types';
import { THEMES } from './themes';

const { MONOSPACE } = constants.FONT;
const FONT_SIZE = 14;

export type ICommandPromptProps = {
  text?: string;
  theme?: ICommandPromptTheme | 'DARK';
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
        filter(() => !this.isFocused),
        filter(e => e.key === 'l' && e.metaKey),
      )
      .subscribe(e => this.focus());

    keydown$
      // Invoke on [Enter]
      .pipe(filter(e => e.key === 'Enter'))
      .subscribe(e => this.fireInvoke());

    keydown$
      // Clear on CMD+K
      .pipe(filter(e => e.key === 'k' && e.metaKey))
      .subscribe(e => this.clear());

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
  public focus() {
    if (this.elInput) {
      this.elInput.focus();
    }
  }

  public clear() {
    this.fireChange(false, '');
  }

  /**
   * [Render]
   */

  public render() {
    const theme = this.theme;
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        flex: 1,
        height: 32,
        fontSize: FONT_SIZE,
        Flex: 'horizontal-center-start',
        fontFamily: MONOSPACE.FAMILY,
      }),
      prefix: css({
        color: theme.prefixColor,
        userSelect: 'none',
        marginLeft: 10,
        marginRight: 5,
        fontWeight: 600,
      }),
      textbox: css({
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.prefix}>{'>'}</div>
        <TextInput
          ref={this.elInputRef}
          style={styles.textbox}
          onChange={this.handleChange}
          value={this.text}
          valueStyle={{
            color: theme.color,
            fontFamily: MONOSPACE.FAMILY,
            fontWeight: 'BOLD',
          }}
          placeholder={'command'}
          placeholderStyle={{ color: theme.placeholderColor }}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private fireChange(invoked: boolean, text: string) {
    text = text || '';
    const { onChange } = this.props;
    const e: ICommandChangeArgs = { text, invoked };
    if (onChange) {
      onChange(e);
    }
  }

  private fireInvoke = () => {
    this.fireChange(true, this.text);
  };

  private handleChange = async (e: TextInputChangeEvent) => {
    this.fireChange(false, e.to);
  };
}
