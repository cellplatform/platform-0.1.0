import React, { useState } from 'react';

import { color, COLORS, css, CssValue, Icons, t, Textbox } from '../common';

export type ConnectRequestEvent = { remote: t.PeerId };
export type ConnectRequestEventHandler = (e: ConnectRequestEvent) => void;

export type OpenConnectionInputProps = {
  placeholder?: string;
  style?: CssValue;
  onConnectRequest?: ConnectRequestEventHandler;
};

export const OpenConnectionInput: React.FC<OpenConnectionInputProps> = (props) => {
  const [pending, setPending] = useState(false);
  const [text, setText] = useState('');
  const input = (text || '').trim();

  /**
   * [Render]
   */
  const styles = {
    base: css({}),
    textbox: css({ fontSize: 12, minWidth: 240 }),
  };

  const elTools = (
    <div {...css({ Flex: 'horizontal-center-center' })}>
      {input && <Icons.Arrow.Forward size={18} opacity={0.5} style={{ marginRight: 4 }} />}
      <Icons.Antenna
        size={18}
        color={input && pending ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.6)}
      />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Textbox
        value={text}
        placeholder={props.placeholder ?? 'open connection'}
        style={styles.textbox}
        spellCheck={false}
        selectOnFocus={true}
        onChange={(e) => {
          setText(e.to);
          setPending(true);
        }}
        enter={{
          isEnabled: Boolean(input),
          icon: (e) => elTools,
          handler() {
            const remote = text.replace(/^peer\:/, '');
            props.onConnectRequest?.({ remote });
            setPending(false);
          },
        }}
      />
    </div>
  );
};
