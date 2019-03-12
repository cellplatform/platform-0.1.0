import * as React from 'react';

import { R, css, color as colorUtil, util, GlamorValue } from '../common';
import { ITextInputStyle, TextInputMaskHandler, ITextInputEvents, ITextInputFocus } from '../types';

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
  public state: IHtmlInputState = {};
  private input: HTMLInputElement;
  private inputRef = (el: HTMLInputElement) => (this.input = el);

  public componentWillMount() {
    this.setValue(this.props);
  }
  public componentDidMount() {
    const { focusOnLoad } = this.props;
    if (focusOnLoad) {
      setTimeout(() => this.focus(), 0);
    }
  }
  public componentWillReceiveProps(nextProps: IHtmlInputProps) {
    this.setValue(nextProps);
  }

  public focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  public blur() {
    if (this.input) {
      this.input.blur();
    }
  }

  public select() {
    if (this.input) {
      this.input.select();
    }
  }

  public caretToEnd() {
    if (this.input) {
      const el = this.input as any;
      if (typeof el.selectionStart === 'number') {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else if (typeof el.createTextRange !== 'undefined') {
        this.focus();
        const range = el.createTextRange();
        range.collapse(false);
        range.select();
      }
    }
  }

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
        onKeyUp={this.props.onKeyUp}
      />
    );
  }

  private setValue = (props: IHtmlInputProps) => {
    let value = props.value || '';
    if (props.maxLength !== undefined && value.length > props.maxLength) {
      value = value.substr(0, props.maxLength);
    }
    this.setState({ value });
  };

  private handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown, onTab } = this.props;
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (onTab && e.key === 'Tab') {
      onTab({
        cancel: () => e.preventDefault(),
      });
    }
  };

  private handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyPress, onEnter } = this.props;
    if (onEnter && e.key === 'Enter') {
      onEnter(e);
    }
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onChange, maxLength, mask } = this.props;

    // Derive values.
    const from = this.state.value || '';
    const to = ((e.target as any).value as string) || '';
    const char = changedCharacter(from, to);
    const isMax = maxLength === undefined ? null : to.length === maxLength;

    // Check whether an input-filter will mask the values.
    if (char && mask) {
      if (!mask({ text: to, char })) {
        return; // Handled.
      }
    }

    // Update state and alert listeners.
    if (onChange && from !== to) {
      onChange({ from, to, isMax, char });
    }
  };

  private handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { focusAction, onFocus } = this.props;
    if (focusAction === 'SELECT') {
      this.select();
    }
    if (focusAction === 'END') {
      this.caretToEnd();
    }
    if (onFocus) {
      onFocus(e);
    }
  };
}

function changedCharacter(from: string, to: string) {
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
