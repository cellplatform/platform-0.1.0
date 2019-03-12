import * as React from 'react';
import {
  R,
  css,
  GlamorValue,
  util,
  MeasureSize,
  toTextCss,
  value as valueUtil,
  time,
} from './common';
import { HtmlInput, IInputValue, DEFAULT_TEXT_STYLE } from './components/HtmlInput';
import { ITextInputFocus, ITextInputStyle, ITextInputEvents } from './types';
import { Text } from '../Text';

const DEFAULT = {
  VALUE_STYLE: DEFAULT_TEXT_STYLE,
  DISABLED_OPACITY: 0.2,
};

export type ITextInputProps = ITextInputFocus &
  ITextInputEvents &
  IInputValue & {
    isEnabled?: boolean;
    isPassword?: boolean;
    disabledOpacity?: number;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    autoSize?: boolean;
    placeholder?: string | React.ReactElement<{}>;
    valueStyle?: ITextInputStyle;
    placeholderStyle?: ITextInputStyle;
    spellCheck?: boolean;
    selectionBackground?: number | string;
    className?: string;
    style?: GlamorValue;
  };

export type ITextInputState = {
  width?: number | string;
};

/**
 * A simple text input field.
 */
export class TextInput extends React.PureComponent<ITextInputProps, ITextInputState> {
  public static DefaultTextStyle = DEFAULT.VALUE_STYLE;
  public static toTextCss = Text.toTextCss;
  public static measure = (props: ITextInputProps) => {
    const { value: content, valueStyle = DEFAULT.VALUE_STYLE } = props;
    const style = toTextCss(valueStyle);
    return MeasureSize.measure({ content, ...style });
  };

  public state: ITextInputState = { width: toInitialWidth(this.props) };

  private isUnmounted = false;
  private input: HtmlInput;
  private inputRef = (el: HtmlInput) => (this.input = el);

  public componentDidMount() {
    this.updateAutoSize();
  }

  public componentDidUpdate() {
    this.updateAutoSize();
  }

  public componentWillUnmount() {
    this.isUnmounted = true;
  }

  /**
   * Measure the current size of the text (width/height).
   */
  public get size() {
    return TextInput.measure(this.props);
  }

  public focus(select?: boolean) {
    if (this.input) {
      this.input.focus();
      if (select) {
        this.input.select();
      }
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
      this.input.caretToEnd();
    }
  }

  public render() {
    const isEnabled = valueUtil.defaultValue(this.props.isEnabled, true);
    const {
      value = '',
      isPassword = false,
      placeholder,
      valueStyle = DEFAULT.VALUE_STYLE,
      disabledOpacity = DEFAULT.DISABLED_OPACITY,
    } = this.props;
    const hasValue = value.length > 0;
    const styles = {
      base: {
        position: 'relative',
        boxSizing: 'border-box',
        width: this.state.width,
      },
      inner: {
        position: 'relative',
      },
      placeholder: {
        Absolute: 0,
        opacity: isEnabled ? 1 : disabledOpacity,
        Flex: 'horizontal-center-start',
        paddingLeft: 3, // Ensure the placeholder does not bump into the input-carret.
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      },
    };

    const elPlaceholder = !hasValue && placeholder && (
      <div {...css(placeholderStyle(this.props), styles.placeholder)}>{placeholder}</div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...css(styles.inner)}>
          {elPlaceholder}
          <HtmlInput
            ref={this.inputRef}
            className={this.props.className}
            isEnabled={isEnabled}
            isPassword={isPassword}
            disabledOpacity={disabledOpacity}
            value={this.props.value}
            maxLength={this.props.maxLength}
            mask={this.props.mask}
            valueStyle={valueStyle}
            focusOnLoad={this.props.focusOnLoad}
            focusAction={this.props.focusAction}
            onKeyPress={this.props.onKeyPress}
            onKeyDown={this.props.onKeyDown}
            onKeyUp={this.props.onKeyUp}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
            onChange={this.props.onChange}
            onEnter={this.props.onEnter}
            onTab={this.props.onTab}
            spellCheck={this.props.spellCheck}
            selectionBackground={this.props.selectionBackground}
          />
        </div>
      </div>
    );
  }

  private updateAutoSize() {
    if (!this.props.autoSize || this.isUnmounted) {
      return;
    }
    time.delay(0, () => {
      // NB: Delay is so size measurement returns accurate number.
      const width = toWidth(this.props);
      if (!this.isUnmounted) {
        this.setState({ width });
      }
    });
  }
}

/**
 * INTERNAL
 */
function toWidth(props: ITextInputProps) {
  if (!props.autoSize) {
    return props.width;
  }

  const value = props.value;
  const maxWidth = valueUtil.defaultValue(props.maxWidth, -1);

  let width = TextInput.measure(props).width;
  width = value === undefined || value === '' ? toMinWidth(props) : width;
  width = typeof maxWidth === 'number' && maxWidth !== -1 && width > maxWidth ? maxWidth : width;

  const charWidth = TextInput.measure({ ...props, value: 'W' }).width;
  return width + charWidth; // NB: Adding an additional char-width prevents overflow jumping on char-enter.
}

function toMinWidth(props: ITextInputProps): number {
  const { minWidth, placeholder, value } = props;
  if (minWidth !== undefined) {
    return minWidth as number;
  }

  if (!value && placeholder) {
    // NB: If min-width not specified, use placeholder width.
    return (
      Text.measure({
        children: props.placeholder,
        style: placeholderStyle(props),
      }).width + 10
    );
  }

  return -1;
}

function toInitialWidth(props: ITextInputProps) {
  const { width, minWidth, autoSize } = props;
  return autoSize ? minWidth : width;
}

function placeholderStyle(props: ITextInputProps) {
  const isEnabled = valueUtil.defaultValue(props.isEnabled, true);
  const { valueStyle = DEFAULT.VALUE_STYLE, placeholderStyle } = props;
  return util.toTextInputCss(isEnabled, R.merge(R.clone(valueStyle), placeholderStyle));
}
