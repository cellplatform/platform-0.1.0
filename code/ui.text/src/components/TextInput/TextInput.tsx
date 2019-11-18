import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Text } from '../Text';
import {
  css,
  GlamorValue,
  MeasureSize,
  mouse,
  R,
  t,
  time,
  toTextCss,
  util,
  defaultValue,
} from './common';
import { DEFAULT_TEXT_STYLE, HtmlInput, IInputValue } from './components/HtmlInput';

const DEFAULT = {
  VALUE_STYLE: DEFAULT_TEXT_STYLE,
  DISABLED_OPACITY: 0.2,
};

export type ITextInputProps = t.ITextInputFocusAction &
  t.ITextInputEvents &
  IInputValue &
  t.IMouseEventProps & {
    events$?: Subject<t.TextInputEvent>;
    isEnabled?: boolean;
    isPassword?: boolean;
    isReadOnly?: boolean;
    disabledOpacity?: number;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    autoSize?: boolean;
    placeholder?: string | React.ReactElement<{}>;
    valueStyle?: t.ITextInputStyle;
    placeholderStyle?: t.ITextInputStyle;
    spellCheck?: boolean;
    autoCapitalize?: boolean;
    autoCorrect?: boolean;
    autoComplete?: boolean;
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
  /**
   * [Static]
   */
  public static DefaultTextStyle = DEFAULT.VALUE_STYLE;
  public static toTextCss = Text.toTextCss;
  public static measure = (props: ITextInputProps) => {
    const { value: content, valueStyle = DEFAULT.VALUE_STYLE } = props;
    const style = toTextCss(valueStyle);
    return MeasureSize.measure({ content, ...style });
  };

  /**
   * [Fields]
   */
  public state: ITextInputState = { width: toInitialWidth(this.props) };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITextInputState>>();
  private events$ = new Subject<t.TextInputEvent>();
  private mouse = mouse.fromProps(this.props, {
    force: ['CLICK', 'DOUBLE_CLICK', 'UP', 'DOWN', 'ENTER', 'LEAVE'],
  });

  private input: HtmlInput;
  private inputRef = (el: HtmlInput) => (this.input = el);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const mouse$ = this.mouse.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));

    state$.subscribe(e => this.setState(e));

    // Bubble events.
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Bubble mouse events.
    mouse$.subscribe(payload => this.fire({ type: 'TEXT_INPUT/mouse', payload }));
  }

  public componentDidMount() {
    this.updateAutoSize();
  }

  public componentDidUpdate() {
    this.updateAutoSize();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isUnmounted() {
    return this.unmounted$.isStopped;
  }

  /**
   * Measure the current size of the text (width/height).
   */
  public get size() {
    return TextInput.measure(this.props);
  }

  /**
   * Determines if the input is currently ocused.
   */
  public get isFocused() {
    const input = this.input;
    return input ? input.isFocused : false;
  }

  /**
   * Determine whether the input currently contains a value.
   */
  public get hasValue() {
    const { value = '' } = this.props;
    return value.length > 0;
  }

  /**
   * [Methods]
   */
  public focus(isFocused?: boolean) {
    if (this.input) {
      if (defaultValue(isFocused, true)) {
        this.input.focus();
      } else {
        this.blur();
      }
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
      this.input.selectAll();
    }
    return this;
  }

  public cursorToStart() {
    if (this.input) {
      this.input.cursorToStart();
    }
    return this;
  }

  public cursorToEnd() {
    if (this.input) {
      this.input.cursorToEnd();
    }
    return this;
  }

  private updateAutoSize() {
    if (!this.props.autoSize || this.isUnmounted) {
      return;
    }
    time.delay(0, () => {
      // NB: Delay is so size measurement returns accurate number.
      const width = toWidth(this.props);
      if (!this.isUnmounted) {
        this.state$.next({ width });
      }
    });
  }

  /**
   * [Render]
   */

  public render() {
    const isEnabled = defaultValue(this.props.isEnabled, true);
    const {
      value = '',
      isPassword = false,
      isReadOnly = false,
      placeholder,
      valueStyle = DEFAULT.VALUE_STYLE,
      disabledOpacity = DEFAULT.DISABLED_OPACITY,
    } = this.props;
    const hasValue = this.hasValue;
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
        paddingLeft: 2, // Ensure the placeholder does not bump into the input-caret.
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        userSelect: 'none',
      },
      readonly: {
        userSelect: 'auto',
      },
      input: {
        visibility: isReadOnly ? 'hidden' : 'visible',
        pointerEvents: isReadOnly ? 'none' : 'auto',
      },
    };

    const elPlaceholder = !hasValue && placeholder && (
      <div
        {...css(placeholderStyle(this.props), styles.placeholder)}
        onDoubleClick={this.labelDblClickHandler('PLACEHOLDER')}
        children={placeholder}
      />
    );

    const elReadOnly = isReadOnly && !elPlaceholder && (
      <div
        {...css(valueStyle, styles.placeholder, styles.readonly)}
        onDoubleClick={this.labelDblClickHandler('READ_ONLY')}
        children={value}
      />
    );

    const elInput = (
      <HtmlInput
        ref={this.inputRef}
        style={styles.input}
        className={this.props.className}
        isEnabled={isEnabled}
        isPassword={isPassword}
        disabledOpacity={disabledOpacity}
        value={value}
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
        onChange={this.handleChange}
        onEnter={this.props.onEnter}
        onTab={this.props.onTab}
        onDblClick={this.handleInputDblClick}
        spellCheck={this.props.spellCheck}
        autoCapitalize={this.props.autoCapitalize}
        autoCorrect={this.props.autoCorrect}
        autoComplete={this.props.autoComplete}
        selectionBackground={this.props.selectionBackground}
        events$={this.events$}
      />
    );

    return (
      <div {...css(styles.base, this.props.style)} className={'p-TextInput'} {...this.mouse.events}>
        <div {...css(styles.inner)}>
          {elPlaceholder}
          {elReadOnly}
          {elInput}
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private fire(e: t.TextInputEvent) {
    this.events$.next(e);
  }

  private handleChange = (e: t.TextInputChangeEvent) => {
    const { onChange } = this.props;

    // Fire the BEFORE event.
    let isCancelled = false;
    this.fire({
      type: 'TEXT_INPUT/changing',
      payload: {
        ...e,
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
      },
    });

    if (isCancelled) {
      return;
    }

    // Fire AFTER event.
    this.fire({ type: 'TEXT_INPUT/changed', payload: e });
    if (onChange) {
      onChange(e);
    }
  };

  private labelDblClickHandler = (target: t.ITextInputLabelDblClick['target']) => {
    return (e: React.MouseEvent) => {
      this.fire({
        type: 'TEXT_INPUT/label/dblClick',
        payload: {
          target,
          type: 'DOUBLE_CLICK',
          button: e.button === 2 ? 'LEFT' : 'RIGHT',
          cancel: () => {
            e.preventDefault();
            e.stopPropagation();
          },
        },
      });
    };
  };

  private handleInputDblClick = (e: React.MouseEvent) => {
    if (!this.hasValue) {
      // NB: When the <input> is dbl-clicked and there is no value
      //     it is deduced that the placeholder was clicked.
      this.labelDblClickHandler('PLACEHOLDER')(e);
    }
  };
}

/**
 * [Helpers]
 */
function toWidth(props: ITextInputProps) {
  if (!props.autoSize) {
    return props.width;
  }

  const value = props.value;
  const maxWidth = defaultValue(props.maxWidth, -1);

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
  const isEnabled = defaultValue(props.isEnabled, true);
  const { valueStyle = DEFAULT.VALUE_STYLE, placeholderStyle } = props;
  const styles = { ...R.clone(valueStyle), ...placeholderStyle };
  return util.toTextInputCss(isEnabled, styles);
}
