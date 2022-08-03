import React, { useState } from 'react';

import { copyToClipboard, css, CssValue, t, time } from '../common';

import { SimpleValue } from './Value.Simple';
import { SwitchValue } from './Value.Switch';
import { Util } from './Value.common';

export type PropListValueProps = {
  item: t.PropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  defaults: t.PropListDefaults;
  theme?: t.PropListTheme;
  style?: CssValue;
};

export const PropListValue: React.FC<PropListValueProps> = (props) => {
  const item = Util.format(props.item);
  const value = item.value;
  const isCopyable = item.isCopyable(props.defaults);

  const [isOver, setOver] = useState<boolean>(false);
  const [message, setMessage] = useState<React.ReactNode>();

  const cursor = item.value.onClick ? 'pointer' : undefined;

  const showMessage = (message: React.ReactNode, delay?: number) => {
    setMessage(message);
    time.delay(delay ?? 1500, () => setMessage(undefined));
  };

  const handleClick = () => {
    const { clipboard, value } = item;
    let message: React.ReactNode;
    let delay: number | undefined;

    value.onClick?.({
      item,
      value,
      message(text, msecs) {
        message = text;
        delay = msecs;
      },
    });

    if (clipboard && isCopyable) {
      const value = typeof clipboard === 'function' ? clipboard() : clipboard;
      copyToClipboard(value ?? '');
      if (!message) {
        const text = (value || '').toString().trim();
        const isHttp = text.startsWith('http://') || text.startsWith('https://');
        message = isHttp ? 'copied url' : 'copied';
      }
    }

    if (message) showMessage(message, delay);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      Flex: 'center-end',
      userSelect: 'none',
      fontWeight: item.value.bold ? 'bold' : undefined,
    }),
    component: css({ flex: 1, Flex: 'center-end' }),
  };

  const renderValue = () => {
    const kind = (value as t.PropListValueKinds).kind;

    if (kind === 'Switch') {
      return <SwitchValue value={value} onClick={handleClick} />;
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
          theme={props.theme}
          onClick={handleClick}
        />
      );
    }

    if (item.isComponent) {
      return (
        <div {...styles.component} onClick={handleClick}>
          {item.value.data}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      {...styles.base}
      title={item.tooltip}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      {renderValue()}
    </div>
  );
};
