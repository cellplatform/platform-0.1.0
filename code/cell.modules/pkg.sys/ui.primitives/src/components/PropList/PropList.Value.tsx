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
    const kind = (value as t.PropListValueKinds).kind;

    if (typeof value.data === 'boolean' && kind === 'Switch') {
      return <SwitchValue value={value} />;
    }

    if (item.isSimple) {
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
