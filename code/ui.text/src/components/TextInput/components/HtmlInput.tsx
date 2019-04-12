import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { color as colorUtil, css, events, GlamorValue, R, t, util } from '../common';
import { ITextInputEvents, ITextInputFocus, ITextInputStyle, TextInputMaskHandler } from '../types';

export const DEFAULT_TEXT_STYLE: ITextInputStyle = {
  opacity: 1,
  color: -1,
  disabledColor: -1,
  italic: false,
  fontSize: undefined,
  fontWeight: undefined,
  fontFamily: undefined,
  letterSpacing: undefined,
  lineHeight: undefined,
};

export interface IInputValue {
  value?: string;
  maxLength?: number;
  mask?: TextInputMaskHandler;
}

export interface IHtmlInputProps extends ITextInputFocus, ITextInputEvents, IInputValue {
  className?: string;
  isEnabled?: boolean;
  isPassword?: boolean;
  disabledOpacity?: number;
  style?: GlamorValue;
  valueStyle?: ITextInputStyle;
  spellCheck?: boolean;
  selectionBackground?: number | string;
}
export interface IHtmlInputState {
  value?: string;
}

/**
 * A raw <input> element used within a <TextInput>.
 */
export class HtmlInput extends React.PureComponent<IHtmlInputProps, IHtmlInputState> {
  /**
   * [Fields]
   */
  public state: IHtmlInputState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IHtmlInputState>>();

  private input: HTMLInputElement;
  private inputRef = (el: HTMLInputElement) => (this.input = el);

  private readonly modifierKeys: t.ITextModifierKeys = {
    alt: false,
    control: false,
    shift: false,
    meta: false,
  };

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Change state safely.
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Monitor keyboard.
    const keypress$ = events.keyPress$.pipe(takeUntil(this.unmounted$));
    const modifier$ = keypress$.pipe(filter(e => e.isModifier));

    // Keep references to currently pressed modifier keys
    modifier$
      .pipe(
        filter(e => e.isPressed),
        map(e => e.key.toLowerCase()),
      )
      .subscribe(key => (this.modifierKeys[key] = true));
    modifier$
      .pipe(
        filter(e => !e.isPressed),
        map(e => e.key.toLowerCase()),
      )
      .subscribe(key => (this.modifierKeys[key] = false));

    // Initialize.
    this.updateValue();
  }

  public componentDidMount() {
    const { focusOnLoad } = this.props;
    if (focusOnLoad) {
      setTimeout(() => this.focus(), 0);
    }
  }

  public componentDidUpdate(prev: IHtmlInputProps) {
    if (this.props.value !== this.state.value) {
      this.updateValue();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public focus() {
    if (this.input) {
      this.input.focus();
    }
    return this;
  }

  public blur() {
    if (this.input) {
      this.input.blur();
    }
    return this;
  }

  public selectAll() {
    if (this.input) {
      this.input.select();
    }
    return this;
  }

  public cursorToStart() {
    if (this.input) {
      const el = this.input as any;

      if (el.setSelectionRange) {
        // Modern browsers
        el.focus();
        el.setSelectionRange(0, 0);
      } else if (el.createTextRange) {
        // IE8 and below.
        const range = el.createTextRange();
        range.collapse(true);
        range.moveEnd('character', 0);
        range.moveStart('character', 0);
        range.select();
      }
    }
    return this;
  }

  public cursorToEnd() {
    if (this.input) {
      const el = this.input as any;
      if (typeof el.selectionStart === 'number') {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else if (typeof el.createTextRange !== 'undefined') {
        const range = el.createTextRange();
        range.collapse(false);
        range.select();
      }
    }
    return this;
  }

  private updateValue(args: { value?: string; maxLength?: number } = {}) {
    const { value = this.props.value, maxLength = this.props.maxLength } = args;
    this.state$.next({ value: formatValue({ value, maxLength }) });
  }

  /**
   * [Render]
   */
  public render() {
    const {
      isEnabled = true,
      disabledOpacity = 0.2,
      isPassword,
      maxLength,
      valueStyle = DEFAULT_TEXT_STYLE,
      selectionBackground,
    } = this.props;

    const styles = {
      base: {
        position: 'relative',
        border: 'none',
        width: '100%',
        outline: 'none',
        background: 'transparent',
        opacity: 1,
      },
    };
    if (selectionBackground) {
      styles.base = {
        ...styles.base,
        '::selection': {
          backgroundColor: colorUtil.format(selectionBackground),
        },
      } as any;
    }
    styles.base = R.merge(styles.base, util.toTextInputCss(isEnabled, valueStyle));
    styles.base.opacity = isEnabled ? 1 : disabledOpacity;

    return (
      <input
        {...css(styles.base, this.props.style)}
        className={this.props.className}
        ref={this.inputRef}
        type={isPassword ? 'password' : 'text'}
        disabled={!isEnabled}
        value={this.state.value}
        onChange={this.handleChange}
        maxLength={maxLength}
        spellCheck={this.props.spellCheck}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onKeyPress={this.handleKeyPress}
        onKeyDown={this.handleKeydown}
        onKeyUp={this.handleKeyup}
      />
    );
  }

  /**
   * [Handlers]
   */
  private handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown, onTab } = this.props;
    const modifierKeys = { ...this.modifierKeys };
    if (onKeyDown) {
      onKeyDown({ ...e, modifierKeys });
    }
    if (onTab && e.key === 'Tab') {
      let isCancelled = false;
      onTab({
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
          e.preventDefault();
        },
        modifierKeys,
      });
    }
  };

  private handleKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyUp } = this.props;
    if (onKeyUp) {
      const modifierKeys = { ...this.modifierKeys };
      onKeyUp({ ...e, modifierKeys });
    }
  };

  private handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyPress, onEnter } = this.props;
    const modifierKeys = { ...this.modifierKeys };
    if (onEnter && e.key === 'Enter') {
      onEnter({ ...e, modifierKeys });
    }
    if (onKeyPress) {
      onKeyPress({ ...e, modifierKeys });
    }
  };

  private handleChange = (e: React.ChangeEvent) => {
    const { onChange, maxLength, mask } = this.props;

    // Derive values.
    const from = this.state.value || '';
    let to = ((e.target as any).value as string) || '';
    to = formatValue({ value: to, maxLength });
    const char = getChangedCharacter(from, to);
    const isMax = maxLength === undefined ? null : to.length === maxLength;

    // Check whether an input-filter will mask the values.
    if (char && mask) {
      if (!mask({ text: to, char })) {
        return; // Handled.
      }
    }

    // Update state and alert listeners.
    if (from !== to) {
      this.updateValue({ value: to, maxLength });
      if (onChange) {
        const modifierKeys = { ...this.modifierKeys };
        onChange({ from, to, isMax, char, modifierKeys });
      }
    }
  };

  private handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { focusAction, onFocus } = this.props;
    if (focusAction === 'SELECT') {
      this.selectAll();
    }
    if (focusAction === 'END') {
      this.cursorToEnd();
    }
    if (onFocus) {
      onFocus(e);
    }
  };
}

/**
 * [Helpers]
 */

function getChangedCharacter(from: string, to: string) {
  if (to.length === from.length) {
    return '';
  }
  if (to.length < from.length) {
    return '';
  }
  let index = 0;
  for (const toChar of to) {
    const fromChar = from[index];
    if (toChar !== fromChar) {
      return toChar; // Exit - changed character found.
    }
    index += 1;
  }
  return ''; // No change.
}

function formatValue(args: { value?: string; maxLength?: number }) {
  const { maxLength } = args;
  let value = args.value || '';
  if (maxLength !== undefined && value.length > maxLength) {
    value = value.substr(0, maxLength);
  }
  return value;
}
