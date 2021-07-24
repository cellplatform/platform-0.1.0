import { copyToClipboard } from '@platform/react/lib';
import React, { useState } from 'react';

import { css, CssValue, defaultValue, t, time } from '../../common';
import { SwitchValue } from './PropList.Value.Switch';
import { SimpleValue } from './PropList.Value.Simple';
import { FormatItem } from './FormatItem';

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

  const cursor = item.value.onClick ? 'pointer' : undefined;

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      Flex: 'center-end',
      userSelect: 'none',
      fontWeight: item.value.bold ? 'bold' : undefined,
    }),
  };

  const showMessage = (message: React.ReactNode, delay?: number) => {
    setMessage(message);
    time.delay(defaultValue(delay, 1500), () => setMessage(undefined));
  };

  const handleClick = () => {
    let message: React.ReactNode;
    let delay: number | undefined;

    const { clipboard, value } = item;
    const { onClick } = value;

    if (onClick) {
      onClick({
        item,
        value,
        message: (text, msecs) => {
          message = text;
          delay = msecs;
        },
      });
    }

    if (clipboard && isCopyable) {
      const value = typeof clipboard === 'function' ? clipboard() : clipboard;
      copyToClipboard(value);
      if (!message) message = 'copied';
    }

    if (message) showMessage(message, delay);
  };

  const renderValue = () => {
    const kind = (value as t.PropListValueKinds).kind;

    if (typeof value.data === 'boolean' && kind === 'Switch') {
      return <SwitchValue value={value} />;
    }

    if (item.isSimple || message) {
      return (
        <SimpleValue
          value={value}
          message={message}
          isOver={isOver}
          isCopyable={isCopyable}
          cursor={cursor}
          defaults={props.defaults}
        />
      );
    }

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
