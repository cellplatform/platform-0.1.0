import React, { useState, useEffect } from 'react';
import { copyToClipboard, css, CssValue, Style, t, time } from '../../common';
import { TextCopyIcon } from './TextCopy.Icon';
import * as k from './types';
import { Icons } from '../Icons';

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
};

export type TextCopyProps = {
  children?: React.ReactNode;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  downOffset?: Pixels;
  icon?: k.TextCopyIcon;
  isCopyable?: boolean;
  style?: CssValue;
  onCopy?: k.TextCopyEventHandler;
  onMouse?: k.TextCopyMouseEventHandler;
};

type V = React.FC<TextCopyProps>;
export const View: V = (props) => {
  const { children, inlineBlock = true, downOffset = 1, icon } = props;

  const [isOver, setOver] = useState(false);
  const [isDown, setDown] = useState(false);
  const [message, setMessage] = useState<undefined | Message>();

  const isCopyable = props.isCopyable === false ? false : Boolean(props.onCopy);
  const hasMessage = message !== undefined;

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

  const fireMouse = (action: k.TextCopyMouseAction) => {
    props.onMouse?.({ isOver, isDown, action });
  };
  const handleOver = (isOver: boolean) => {
    setOver(isOver);
    fireMouse(isOver ? 'Over' : 'Leave');
  };
  const handlePress = (isDown: boolean) => {
    setDown(isDown);
    fireMouse(isDown ? 'Down' : 'Up');
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
type C = V & { Icon: t.IIcon };
export const TextCopy: C = View as any;
TextCopy.Icon = Icons.Copy;
