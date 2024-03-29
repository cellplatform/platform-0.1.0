import React, { useState, useEffect } from 'react';
import { copyToClipboard, css, CssValue, Style, t, time, FC } from '../../common';
import { TextCopyIcon } from './TextCopy.Icon';
import * as k from './types';
import { Icons } from '../Icons';

/**
 * Types
 */
type Milliseconds = number;
type Pixels = number;
type Percent = number;
type Message = {
  value: JSX.Element | string;
  delay?: Milliseconds;
  opacity?: number;
  blur?: Pixels;
  grayscale?: Percent;
};

const DEFAULT = {
  MESSAGE_DELAY: 1000,
  TOOLTIP: 'Copy',
};

export type TextCopyProps = {
  children?: React.ReactNode;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  downOffset?: Pixels;
  icon?: k.TextCopyIcon;
  isCopyable?: boolean;

  tooltip?: boolean | string;
  style?: CssValue;
  onCopy?: k.TextCopyEventHandler;
  onMouse?: k.TextCopyMouseEventHandler;
};

/**
 * Component
 */
const View: React.FC<TextCopyProps> = (props) => {
  const { children, inlineBlock = true, downOffset = 1, icon } = props;

  const [isOver, setOver] = useState(false);
  const [isDown, setDown] = useState(false);
  const [message, setMessage] = useState<undefined | Message>();

  const isCopyable = props.isCopyable === false ? false : Boolean(props.onCopy);
  const hasMessage = message !== undefined;

  const tooltip = (() => {
    const { tooltip } = props;
    if (tooltip === null) return undefined;
    if (tooltip === undefined) return DEFAULT.TOOLTIP;
    if (typeof tooltip === 'string') return tooltip;
    return undefined;
  })();

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    let timer: t.TimeDelayPromise | undefined;
    if (message) {
      const msecs = message.delay ?? DEFAULT.MESSAGE_DELAY;
      timer = time.delay(msecs, clearMessage);
    }
    return () => timer?.cancel();
  }, [message]);

  /**
   * [Event Handlers]
   */
  const clearMessage = () => setMessage(undefined);

  const handleClick = () => {
    if (isCopyable) {
      let text: undefined | string;
      let message: undefined | Message;
      const e: k.TextCopyEvent = {
        children,
        copy: (value) => (text = value),
        message(value, options = {}) {
          const { delay, opacity, blur, grayscale } = options;
          message = { value, delay, opacity, blur, grayscale };
        },
      };
      props.onCopy?.(e);
      if (typeof text === 'string') copyToClipboard(text);
      setMessage(message);
    }
  };

  const updateState = (args: {
    action: k.TextCopyMouseEvent['action'];
    isOver: boolean;
    isDown: boolean;
  }) => {
    const { action, isOver, isDown } = args;
    setOver(isOver);
    setDown(isDown);
    props.onMouse?.({ action, isOver, isDown });
  };

  const handlePress = (isDown: boolean) => {
    updateState({ isOver, isDown, action: isOver ? 'Over' : 'Leave' });
  };
  const handleOver = (isOver: boolean) => {
    updateState({
      isOver,
      isDown: !isOver ? false : isDown,
      action: isOver ? 'Over' : 'Leave',
    });
  };

  let filter = '';
  if (typeof message?.blur === 'number') filter += `blur(${message.blur}px) `;
  if (typeof message?.grayscale === 'number') filter += `grayscale(${message.grayscale}) `;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      display: inlineBlock && 'inline-block',
      cursor: isCopyable ? 'pointer' : 'default',
      userSelect: isCopyable ? 'none' : 'auto',
      transform: isCopyable ? `translateY(${isDown ? downOffset : 0}px)` : undefined,
      ...Style.toPadding(props.padding),
      ...Style.toMargins(props.margin),
    }),
    body: css({
      position: 'relative',
      opacity: hasMessage ? message.opacity ?? 0 : 1,
      filter: filter || undefined,
    }),
    message: css({
      Absolute: 0,
      Flex: 'x-center-center',
    }),
  };

  const elIcon = icon && isOver && isCopyable && !hasMessage && (
    <TextCopyIcon element={icon.element} edge={icon.edge} offset={icon.offset} />
  );

  const elBody = <div {...styles.body}>{children}</div>;
  const elMessage = hasMessage && <div {...styles.message}>{message.value}</div>;

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => handleOver(true)}
      onMouseLeave={() => handleOver(false)}
      onMouseDown={() => handlePress(true)}
      onMouseUp={() => handlePress(false)}
      onClick={handleClick}
      title={!elMessage ? tooltip : undefined}
    >
      {elBody}
      {elMessage}
      {elIcon}
    </div>
  );
};

/**
 * Export (API)
 */
type Fields = { Icon: t.IIcon };
export const TextCopy = FC.decorate<TextCopyProps, Fields>(
  View,
  { Icon: Icons.Copy },
  { displayName: 'TextCopy' },
);
