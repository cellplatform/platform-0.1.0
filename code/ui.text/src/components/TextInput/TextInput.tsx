import * as React from 'react';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import { Text } from '../Text';
import {
  css,
  GlamorValue,
  MeasureSize,
  R,
  time,
  toTextCss,
  util,
  value as valueUtil,
  t,
} from './common';
import { DEFAULT_TEXT_STYLE, HtmlInput, IInputValue } from './components/HtmlInput';
import { ITextInputEvents, ITextInputFocus, ITextInputStyle } from './types';

const DEFAULT = {
  VALUE_STYLE: DEFAULT_TEXT_STYLE,
  DISABLED_OPACITY: 0.2,
};

export type ITextInputProps = ITextInputFocus &
  ITextInputEvents &
  IInputValue & {
    events$?: Subject<t.TextInputEvent>;
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
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITextInputState>>();
  private _events$ = new Subject<t.TextInputEvent>();
  public events = this._events$.pipe(takeUntil(this.unmounted$));

  private input: HtmlInput;
  private inputRef = (el: HtmlInput) => (this.input = el);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    if (this.props.events$) {
      this.events.subscribe(this.props.events$);
    }
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
   * [Methods]
   */

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
            onChange={this.handleChange}
            onEnter={this.props.onEnter}
            onTab={this.props.onTab}
            spellCheck={this.props.spellCheck}
            selectionBackground={this.props.selectionBackground}
          />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private fire(e: t.TextInputEvent) {
    this._events$.next(e);
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
}

/**
 * [Helpers]
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
