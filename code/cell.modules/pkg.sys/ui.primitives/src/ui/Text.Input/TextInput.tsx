import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

import { css, DEFAULT, R, rx, t, time, FC } from './common';
import { HtmlInput } from './TextInput.Html';
import { TextInputProps } from './types';
import { Util } from './Util';
import { TextInputEvents, TextInputMasks } from './logic';

export { TextInputProps };

/**
 * Component
 */
const View: React.FC<TextInputProps> = (props) => {
  const {
    value = '',
    isPassword = false,
    isReadOnly = false,
    isEnabled = true,
    placeholder,
    valueStyle = DEFAULT.TEXT.STYLE,
    disabledOpacity = DEFAULT.DISABLED_OPACITY,
  } = props;

  const events$ = props.events$ ?? new Subject<t.TextInputEvent>();
  const instance: t.TextInputInstance = props.instance ?? { bus: rx.bus(), id: 'default' };

  const hasValue = value.length > 0;
  const [width, setWidth] = useState<string | number | undefined>();

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { autoSize } = props;
    if (autoSize) time.delay(0, () => setWidth(toWidth(props))); // NB: Delay is so size measurement returns accurate number.
    if (!autoSize) setWidth(undefined);
  }, [value, props.autoSize]); // eslint-disable-line

  /**
   * [Handlers]
   */
  const fire = (e: t.TextInputEvent) => events$?.next(e);

  const handleChange = (e: t.TextInputChangeEvent) => {
    // Fire the BEFORE event.
    let isCancelled = false;
    fire({
      type: 'sys.ui.TextInput/Changing',
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

    if (isCancelled) return;

    // Fire AFTER event.
    fire({ type: 'sys.ui.TextInput/Changed', payload: e });
    props.onChange?.(e);
  };

  const handleInputDblClick = (e: React.MouseEvent) => {
    // NB: When the <input> is dbl-clicked and there is no value
    //     it is deduced that the placeholder was clicked.
    if (!hasValue) labelDblClickHandler('PLACEHOLDER')(e);
  };

  const labelDblClickHandler = (target: t.TextInputLabelDblClick['target']) => {
    return (e: React.MouseEvent) => {
      /**
       * TODO 🐷
       * - old event structure
       */
      // fire({
      //   type: 'sys.ui.TextInput/label/dblClick',
      //   payload: {
      //     target,
      //     type: 'DOUBLE_CLICK',
      //     button: e.button === 2 ? 'LEFT' : 'RIGHT',
      //     cancel: () => {
      //       e.preventDefault();
      //       e.stopPropagation();
      //     },
      //   },
      // });
    };
  };

  /**
   * [Render]
   */

  const styles = {
    base: { position: 'relative', boxSizing: 'border-box', width },
    inner: { position: 'relative' },
    placeholder: {
      Absolute: 0,
      opacity: isEnabled ? 1 : disabledOpacity,
      transition: `opacity 200ms`,
      Flex: 'horizontal-center-start',
      paddingLeft: 2, // Ensure the placeholder does not bump into the input-caret.
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      userSelect: 'none',
    },
    readonly: { userSelect: 'auto' },
    input: {
      visibility: isReadOnly ? 'hidden' : 'visible',
      pointerEvents: isReadOnly ? 'none' : 'auto',
    },
  };

  const elPlaceholder = !hasValue && placeholder && (
    <div
      {...css(styles.placeholder, Util.css.toPlaceholder(props))}
      onDoubleClick={labelDblClickHandler('PLACEHOLDER')}
    >
      {placeholder}
    </div>
  );

  const elReadOnly = isReadOnly && !elPlaceholder && (
    <div
      {...css(valueStyle, styles.placeholder, styles.readonly)}
      onDoubleClick={labelDblClickHandler('READ_ONLY')}
    >
      {value}
    </div>
  );

  const elInput = (
    <HtmlInput
      instance={instance}
      events$={events$}
      style={styles.input}
      className={props.className}
      isEnabled={isEnabled}
      isPassword={isPassword}
      disabledOpacity={disabledOpacity}
      value={value}
      maxLength={props.maxLength}
      mask={props.mask}
      valueStyle={valueStyle}
      selectOnFocus={props.selectOnFocus}
      focusOnLoad={props.focusOnLoad}
      focusAction={props.focusAction}
      onKeyPress={props.onKeyPress}
      onKeyDown={props.onKeyDown}
      onKeyUp={props.onKeyUp}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onChange={handleChange}
      onEnter={props.onEnter}
      onEscape={props.onEscape}
      onTab={props.onTab}
      onDblClick={handleInputDblClick}
      spellCheck={props.spellCheck}
      autoCapitalize={props.autoCapitalize}
      autoCorrect={props.autoCorrect}
      autoComplete={props.autoComplete}
      selectionBackground={props.selectionBackground}
    />
  );

  return (
    <div
      {...css(styles.base, props.style)}
      className={'sys.ui.TextInput'}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <div {...css(styles.inner)}>
        {elPlaceholder}
        {elReadOnly}
        {elInput}
      </div>
    </div>
  );
};

/**
 * [Helpers]
 */
export const toWidth = (props: t.TextInputProps) => {
  if (!props.autoSize) return props.width;

  const value = props.value;
  const maxWidth = props.maxWidth ?? -1;

  let width = Util.measure.input(props).width;
  width = value === undefined || value === '' ? toMinWidth(props) : width;
  width = typeof maxWidth === 'number' && maxWidth !== -1 && width > maxWidth ? maxWidth : width;

  const charWidth = Util.measure.input({ ...props, value: 'W' }).width;
  return width + charWidth; // NB: Adding an additional char-width prevents overflow jumping on char-enter.
};

export const toMinWidth = (props: t.TextInputProps): number => {
  const { minWidth, placeholder, value } = props;

  if (minWidth !== undefined) return minWidth as number;

  // NB: If min-width not specified, use placeholder width.
  if (!value && placeholder) {
    return (
      Util.measure.text({
        children: props.placeholder,
        style: Util.css.toPlaceholder(props),
      }).width + 10
    );
  }

  return -1;
};

/**
 * Export
 */
type Fields = {
  Events: typeof TextInputEvents;
  Masks: typeof TextInputMasks;
};
export const TextInput = FC.decorate<TextInputProps, Fields>(
  View,
  { Events: TextInputEvents, Masks: TextInputMasks },
  { displayName: 'TextInput' },
);
