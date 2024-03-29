import React, { useState } from 'react';

import { Icons, COLORS, css, Textbox, color } from '../DEV.common';

export type DevEventBusTextboxProps = {
  onBroadcast?: (e: { message: string; filter: string }) => void;
};

export const DevEventBusTextbox: React.FC<DevEventBusTextboxProps> = (props) => {
  const styles = {
    base: css({}),
    textbox: css({ MarginX: 20, fontSize: 12, marginBottom: 10 }),
  };

  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');

  const broadcast = () => {
    props.onBroadcast?.({
      message: message.trim(),
      filter: filter.trim(),
    });
  };

  const elFilter = (
    <Textbox
      value={filter}
      placeholder={'target filter: peer/connection'}
      onChange={(e) => setFilter(e.to)}
      style={styles.textbox}
      enter={{ handler: broadcast }}
    />
  );

  const elMessage = (
    <Textbox
      value={message}
      placeholder={'broadcast sample event'}
      onChange={(e) => setMessage(e.to)}
      style={styles.textbox}
      enter={{
        handler: broadcast,
        icon: (e) => {
          const msg = message.trim();
          const col = msg || e.isFocused ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.3);
          const el = <Icons.Send size={16} color={col} />;
          return el;
        },
      }}
    />
  );

  return (
    <>
      {elFilter}
      {elMessage}
    </>
  );
};
