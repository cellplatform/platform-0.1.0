import React, { useState } from 'react';

import { TextInput, color, COLORS, css, CssValue, Icons, t, Textbox, Button } from '../common';

const THEMES: OpenConnectionInputTheme[] = ['Light', 'Dark'];
const DEFAULT_THEME: OpenConnectionInputTheme = 'Light';
const DEFAULT = {
  THEME: DEFAULT_THEME,
};

export type OpenConnectionInputTheme = 'Dark' | 'Light';
export const OpenConnectionInputConstants = {
  DEFAULT,
  THEMES,
};

export type ConnectRequestEvent = { remote: t.PeerId };
export type ConnectRequestEventHandler = (e: ConnectRequestEvent) => void;

export type OpenConnectionInputProps = {
  placeholder?: string;
  theme?: OpenConnectionInputTheme;
  style?: CssValue;
  onConnectRequest?: ConnectRequestEventHandler;
};

export const OpenConnectionInput: React.FC<OpenConnectionInputProps> = (props) => {
  const { theme = 'Light' } = props;

  const [pending, setPending] = useState(false);
  const [text, setText] = useState('');
  const input = (text || '').trim();

  const isInvokable = Boolean(input && pending);
  const isDark = theme === 'Dark';

  const COL_BASE = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_HIGHLIGHT = isDark ? COLORS.WHITE : COLORS.BLUE;
  const COL_ICON = {
    ARROW: Boolean(input && !pending) ? COL_HIGHLIGHT : color.alpha(COL_BASE, 0.8),
    ANTENNA: isInvokable ? COL_HIGHLIGHT : color.alpha(COL_BASE, 0.6),
    TERMINAL: isDark ? COLORS.WHITE : color.alpha(COL_BASE, 0.5),
  };
  const COL_TEXT = {
    VALUE: isDark ? COLORS.WHITE : COLORS.DARK,
    PLACEHOLDER: isDark ? 0.3 : -0.3,
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'x-stretch-stretch',
      minWidth: 240,
      color: COL_BASE,
    }),
    textbox: {
      base: css({ flex: 1, Flex: 'x-center-center' }),
      input: css({
        top: -5,
        flex: 1,
        position: 'relative',
        borderBottom: `dashed 1px ${color.format(isDark ? 0.2 : -0.1)}`,
      }),
    },
    left: {
      icon: css({ position: 'relative', top: -2, marginRight: 4 }),
    },
    right: {
      base: css({ Flex: 'x-center-center', position: 'relative', top: -2, marginLeft: 1 }),
      divider: css({ width: 4 }),
    },
  };

  const elIconTerminal = (
    <Icons.Terminal color={COL_ICON.TERMINAL} style={styles.left.icon} size={20} />
  );
  const elIconArrow = input && <Icons.Arrow.Forward size={18} color={COL_ICON.ARROW} />;
  const elIconDivider = <div {...styles.right.divider} />;
  const elIconNetwork = <Icons.Antenna size={18} color={COL_ICON.ANTENNA} />;

  const elRight = (
    <Button isEnabled={isInvokable}>
      <div {...styles.right.base}>
        {elIconArrow}
        {elIconDivider}
        {elIconNetwork}
      </div>
    </Button>
  );

  const elTextbox = (
    <TextInput
      style={styles.textbox.input}
      value={text}
      placeholder={props.placeholder ?? 'open connection'}
      valueStyle={{ color: COL_TEXT.VALUE, fontSize: 12 }}
      placeholderStyle={{ italic: true, color: COL_TEXT.PLACEHOLDER }}
      spellCheck={false}
      selectOnFocus={true}
      onChange={(e) => {
        setText(e.to);
        setPending(true);
      }}
      onEnter={(e) => {
        const remote = text.trim().replace(/^peer\:/, '');
        props.onConnectRequest?.({ remote });
        setPending(false);
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elIconTerminal}
      <div {...styles.textbox.base}>{elTextbox}</div>
      {elRight}
    </div>
  );
};
