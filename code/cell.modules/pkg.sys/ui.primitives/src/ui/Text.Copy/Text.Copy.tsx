import React, { useState, useEffect } from 'react';
import { copyToClipboard, css, CssValue, Style, t, time } from '../../common';
import { TextCopyIcon } from './TextCopy.Icon';

type Milliseconds = number;
type Pixels = number;

const DEFAULT = {
  MESSAGE_DELAY: 1000,
};

export type TextCopyMouseEvent = { isOver: boolean; isDown: boolean };
export type TextCopyMouseEventHandler = (e: TextCopyMouseEvent) => void;

export type TextCopyEvent = {
  children: React.ReactNode;
  copy(value: string): void;
  message(value: string | JSX.Element, options?: { delay?: Milliseconds }): void;
};
export type TextCopyEventHandler = (e: TextCopyEvent) => void;

export type TextCopyIcon = {
  element: JSX.Element | (() => JSX.Element);
  edge?: 'N' | 'S' | 'W' | 'E';
  offset?: number;
};

export type TextCopyProps = {
  children?: React.ReactNode;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  downOffset?: Pixels;
  icon?: TextCopyIcon;
  style?: CssValue;
  onCopy?: TextCopyEventHandler;
  onMouse?: TextCopyMouseEventHandler;
};

export const TextCopy: React.FC<TextCopyProps> = (props) => {
  const { children, inlineBlock = true, downOffset = 1, icon } = props;

  const [isOver, setOver] = useState(false);
  const [isDown, setDown] = useState(false);
  const [message, setMessage] = useState<undefined | JSX.Element | string>();
  const [messageDelay, setMessageDelay] = useState<Milliseconds | undefined>();

  const isCopyable = Boolean(props.onCopy);
  const hasMessage = message !== undefined;

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    let timer: t.TimeDelayPromise | undefined;
    if (message) {
      timer = time.delay(messageDelay ?? DEFAULT.MESSAGE_DELAY, resetMessage);
    }
    return () => timer?.cancel();
  }, [message, messageDelay]);

  /**
   * [Event Handlers]
   */

  const resetMessage = () => {
    setMessage(undefined);
    setMessageDelay(undefined);
  };

  const handleClick = () => {
    if (isCopyable) {
      let value: undefined | string;
      let message: undefined | string | JSX.Element;
      let messageDelay: undefined | number;
      const e: TextCopyEvent = {
        children,
        copy: (input) => (value = input),
        message(input, options = {}) {
          message = input;
          messageDelay = options.delay;
        },
      };
      props.onCopy?.(e);
      if (typeof value === 'string') copyToClipboard(value);
      if (message !== undefined) setMessage(message);
      setMessageDelay(messageDelay);
    }
  };

  const fireMouse = () => props.onMouse?.({ isOver, isDown });
  const handleOver = (isOver: boolean) => {
    setOver(isOver);
    fireMouse();
  };
  const handlePress = (isDown: boolean) => {
    setDown(isDown);
    fireMouse();
  };

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
      visibility: hasMessage ? 'hidden' : 'visible',
    }),
    message: css({ Absolute: 0, Flex: 'x-center-center' }),
  };

  const elIcon = icon && isOver && isCopyable && !hasMessage && (
    <TextCopyIcon element={icon.element} edge={icon.edge} offset={icon.offset} />
  );

  const elBody = <div {...styles.body}>{children}</div>;
  const elMessage = hasMessage && <div {...styles.message}>{message}</div>;

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => handleOver(true)}
      onMouseLeave={() => handleOver(false)}
      onMouseDown={() => handlePress(true)}
      onMouseUp={() => handlePress(false)}
      onClick={handleClick}
    >
      {elBody}
      {elMessage}
      {elIcon}
    </div>
  );
};
