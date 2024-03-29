import React, { useEffect, useRef, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { useFocus } from '../../hooks/Focus';
import { Keyboard } from '../../keyboard';
import { color, css, DEFAULT, R, rx, t, time } from './common';
import { Util } from './Util';

/**
 * Types
 */
export type HtmlInputProps = t.TextInputFocusAction &
  t.TextInputEventHandlers &
  t.TextInputValue & {
    instance: t.TextInputInstance;
    events: t.TextInputEvents;
    className?: string;
    isEnabled?: boolean;
    isPassword?: boolean;
    disabledOpacity?: number;
    style?: t.CssValue;
    valueStyle?: t.TextInputStyle;
    selectionBackground?: number | string;
    spellCheck?: boolean;
    autoCapitalize?: boolean;
    autoCorrect?: boolean;
    autoComplete?: boolean;
    onDoubleClick?: React.MouseEventHandler;
  };

/**
 * Component
 */
export const HtmlInput: React.FC<HtmlInputProps> = (props) => {
  const {
    value = '',
    events,
    isEnabled = true,
    disabledOpacity = 0.2,
    isPassword,
    maxLength,
    selectionBackground,
    valueStyle = DEFAULT.TEXT.STYLE,
  } = props;

  const instance = props.instance.id;

  const inputRef = useRef<HTMLInputElement>(null);
  const focusState = useFocus(inputRef, { redraw: false });

  const keyboard = Keyboard.useKeyboardState({ bus: props.instance.bus, instance });
  const cloneModifierKeys = () => ({ ...keyboard.state.current.modifiers });

  /**
   * [Lifecycle]: Cursor/focus controller
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    events.focus.$.pipe(takeUntil(dispose$)).subscribe((e) => {
      if (e.focus) focus();
      if (!e.focus) blur();
    });

    events.cursor.$.pipe(takeUntil(dispose$)).subscribe((e) => {
      if (e.action === 'Cursor:Start') cursorToStart();
      if (e.action === 'Cursor:End') cursorToEnd();
    });

    events.select.$.pipe(takeUntil(dispose$)).subscribe((e) => {
      selectAll();
    });

    if (props.focusOnLoad) time.delay(0, () => focus());

    return dispose;
  }, []); // eslint-disable-line

  /**
   * [Lifecycle]: Status response controller.
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    const toStatus = (): t.TextInputStatus => {
      const input = inputRef.current;
      const size = { width: input?.offsetWidth ?? -1, height: input?.offsetHeight ?? -1 };
      const selection = { start: input?.selectionStart ?? -1, end: input?.selectionEnd ?? -1 };
      return {
        instance: events.instance,
        focused: focusState.withinFocus,
        empty: value.length === 0,
        value,
        size,
        selection,
      };
    };

    events.status.req$.pipe(takeUntil(dispose$)).subscribe((e) => {
      const { tx } = e;
      fire({
        type: 'sys.ui.TextInput/Status:res',
        payload: { tx, instance, status: toStatus() },
      });
    });

    return dispose;
  }, [value]); // eslint-disable-line

  /**
   * [Handlers]
   */
  const handleChange = (e: React.ChangeEvent) => {
    const { onChange, maxLength, mask } = props;

    // Derive values.
    const from = value;
    let to = ((e.target as any).value as string) || '';
    to = Util.value.format({ value: to, maxLength });
    const char = Util.value.getChangedChar(from, to);
    const isMax = maxLength === undefined ? null : to.length === maxLength;

    // Check whether an input-filter will mask the value.
    if (char && mask) {
      if (!mask({ text: to, char })) return; // Handled.
    }

    // Update state and alert listeners.
    if (from !== to) {
      onChange?.({ instance, from, to, isMax, char, modifierKeys: cloneModifierKeys() });
    }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown, onEscape, onTab } = props;
    const event = toKeyboardEvent(e);

    if (onKeyDown) onKeyDown(event);
    if (onEscape && e.key === 'Escape') onEscape(event);

    if (onTab && e.key === 'Tab') {
      let isCancelled = false;
      onTab({
        instance,
        modifierKeys: cloneModifierKeys(),
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
          e.preventDefault();
        },
      });
    }

    fireKeyboard(event, true);
  };

  const handleKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const event = toKeyboardEvent(e);
    props.onKeyUp?.(event);
    fireKeyboard(event, false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const modifierKeys = cloneModifierKeys();
    const event = { ...e, instance, modifierKeys };
    if (e.key === 'Enter') props.onEnter?.(event);
    props.onKeyPress?.(event);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { focusAction, onFocus } = props;

    if (focusAction === 'Select') selectAll();
    if (focusAction === 'Cursor:Start') cursorToStart();
    if (focusAction === 'Cursor:End') cursorToEnd();

    onFocus?.(e);
    fire({
      type: 'sys.ui.TextInput/Focus',
      payload: { instance, focus: true },
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    fire({
      type: 'sys.ui.TextInput/Focus',
      payload: { instance, focus: false },
    });
  };

  /**
   * [Utility]
   */

  const toKeyboardEvent = (e: React.KeyboardEvent<HTMLInputElement>): t.TextInputKeyEvent => {
    return {
      ...e,
      instance,
      modifierKeys: cloneModifierKeys(),
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    };
  };

  const fireKeyboard = (event: t.TextInputKeyEvent, isPressed: boolean) => {
    fire({
      type: 'sys.ui.TextInput/Keypress',
      payload: { instance, key: event.key, pressed: isPressed, event },
    });
  };

  const fire = (event: t.TextInputEvent) => props.instance.bus.fire(event);
  const focus = () => inputRef.current?.focus();
  const blur = () => inputRef.current?.blur();
  const selectAll = () => inputRef.current?.select();

  const cursorToStart = () => {
    const el = inputRef.current as any;

    if (el) {
      el.focus();
      if (el.setSelectionRange) {
        // Modern browsers.
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
  };

  const cursorToEnd = () => {
    const el = inputRef.current as any;
    if (el) {
      el.focus();
      if (typeof el.selectionStart === 'number') {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else if (typeof el.createTextRange !== 'undefined') {
        const range = el.createTextRange();
        range.collapse(false);
        range.select();
      }
    }
  };

  /**
   * [Render]
   */

  const styles = {
    base: {
      position: 'relative',
      border: 'none',
      width: '100%',
      lineHeight: 0,
      outline: 'none',
      background: 'transparent',
      boxSizing: 'border-box',
      opacity: 1,
    },
  };

  if (selectionBackground) {
    styles.base = {
      ...styles.base,
      '::selection': { backgroundColor: color.format(selectionBackground) },
    } as any;
  }

  styles.base = R.mergeDeepRight(styles.base, Util.css.toTextInput(isEnabled, valueStyle));
  styles.base.opacity = isEnabled ? 1 : disabledOpacity;

  return (
    <input
      {...css(styles.base, props.style)}
      className={props.className}
      ref={inputRef}
      type={isPassword ? 'password' : 'text'}
      disabled={!isEnabled}
      value={value}
      maxLength={maxLength}
      spellCheck={props.spellCheck}
      autoCapitalize={props.autoCapitalize === false ? 'off' : undefined}
      autoCorrect={props.autoCorrect === false ? 'off' : undefined}
      autoComplete={props.autoComplete === false ? 'off' : undefined}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      onKeyDown={handleKeydown}
      onKeyUp={handleKeyup}
      onDoubleClick={props.onDoubleClick}
    />
  );
};
