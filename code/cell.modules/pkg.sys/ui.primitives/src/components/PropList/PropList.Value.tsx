import { copyToClipboard } from '@platform/react/lib';
import React, { useState } from 'react';

import { color, COLORS, css, CssValue, defaultValue, t, time } from '../../common';
import { Switch } from '../../components.ref/button/Switch';
import { Icons } from '../Icons';
import { FormatItem } from './util';

export type PropListValueProps = {
  item: t.PropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  defaults: t.PropListDefaults;
  style?: CssValue;
};

export const PropListValue: React.FC<PropListValueProps> = (props) => {
  const item = FormatItem(props.item);
  const value = item.value;
  const isCopyable = item.isCopyable(props.defaults);

  const [isOver, setIsOver] = useState<boolean>(false);
  const [message, setMessage] = useState<React.ReactNode>();

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      Flex: 'center-end',
      userSelect: 'none',
    }),
  };

  const showMessage = (message: React.ReactNode, delay?: number) => {
    setMessage(message);
    time.delay(defaultValue(delay, 1500), () => setMessage(undefined));
  };

  const handleClick = () => {
    let message: React.ReactNode;
    const { clipboard, value } = item;
    const { onClick } = value;

    if (onClick) {
      onClick({ item, value, message: (message, delay) => showMessage(message, delay) });
    }

    if (clipboard && isCopyable) {
      copyToClipboard(clipboard);
      if (!message) message = 'copied';
    }

    if (message) showMessage(message);
  };

  const renderValue = () => {
    if (typeof value.data === 'boolean') return <BooleanValue value={value} />;
    if (item.isSimple)
      return (
        <SimpleValue
          value={value}
          message={message}
          isOver={isOver}
          isCopyable={isCopyable}
          defaults={props.defaults}
        />
      );
    if (item.isComponent) return item.value.data;
    return null;
  };

  return (
    <div
      {...styles.base}
      title={item.tooltip}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
      onClick={handleClick}
    >
      {renderValue()}
    </div>
  );
};

/**
 * SimpleValue
 */
export const SimpleValue: React.FC<{
  defaults: t.PropListDefaults;
  value: t.PropListValue;
  message?: React.ReactNode;
  isOver?: boolean;
  isCopyable?: boolean;
}> = (props) => {
  const { value, message, isOver, isCopyable } = props;

  const isCopyActive = isOver && isCopyable;
  const isMonospace = defaultValue(value.monospace, props.defaults.monospace);
  const textColor = message ? color.format(-0.3) : isCopyActive ? COLORS.BLUE : COLORS.DARK;

  const styles = {
    base: css({
      position: 'relative',
      flex: 1,
      height: 13,
    }),
    text: css({
      Absolute: 0,
      color: textColor,
      width: '100%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: isCopyActive ? 'pointer' : 'default',
      textAlign: 'right',
      fontFamily: isMonospace ? 'monospace' : undefined,
    }),
  };

  const text = message ? message : value.data;

  return (
    <div {...css(styles.base)}>
      <div {...styles.text}>{text}</div>
      {isCopyActive && !message && <CopyIcon />}
    </div>
  );
};

/**
 * Boolean.
 */
export const BooleanValue: React.FC<{ value: t.PropListValue }> = (props) => {
  return <Switch height={16} value={props.value.data as boolean} />;
};

/**
 * Copy icon.
 */
export const CopyIcon: React.FC = (props) => {
  const styles = {
    base: css({ Absolute: [2, -12, null, null], opacity: 0.8 }),
  };
  return <Icons.Copy style={styles.base} color={COLORS.DARK} size={10} />;
};
