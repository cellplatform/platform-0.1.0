import React, { useState } from 'react';

import { TextInput, color, COLORS, css, CssValue, Icons, t, Button } from '../common';

/**
 * Types
 */
export type CommandTextboxTheme = 'Dark' | 'Light';
export type CommandTextboxActionEvent = { text: string };
export type CommandTextboxActionEventHandler = (e: CommandTextboxActionEvent) => void;

export type CommandTextboxProps = {
  placeholder?: string;
  theme?: CommandTextboxTheme;
  style?: CssValue;
  onAction?: CommandTextboxActionEventHandler;
};

/**
 * Constants
 */
const THEMES: CommandTextboxTheme[] = ['Light', 'Dark'];
const DEFAULT_THEME: CommandTextboxTheme = 'Light';
const DEFAULT = {
  THEME: DEFAULT_THEME,
  PLACEHOLDER: 'command',
};
export const OpenConnectionInputConstants = { DEFAULT, THEMES };

/**
 * Component
 */
export const CommandTextbox: React.FC<CommandTextboxProps> = (props) => {
  const { theme = 'Light' } = props;

  const [pending, setPending] = useState(false);
  const [text, setText] = useState('');
  const input = (text || '').trim();

  const isInvokable = Boolean(input && pending);
  const isDark = theme === 'Dark';

  const COL_BASE = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_HIGHLIGHT = isDark ? COLORS.WHITE : COLORS.BLUE;
  const COL_ICON = {
    EMPTY: isInvokable ? COL_HIGHLIGHT : isDark ? COL_BASE : color.alpha(COL_BASE, 0.8),
    PENDING: Boolean(input && !pending) ? COL_HIGHLIGHT : color.alpha(COL_BASE, 0.8),
    TERMINAL: isDark ? COLORS.WHITE : color.alpha(COL_BASE, 0.5),
  };
  const COL_TEXT = {
    VALUE: COL_BASE,
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
      base: css({
        top: -3,
        Flex: 'x-center-center',
        position: 'relative',
        marginLeft: 1,
      }),
      divider: css({ width: 4 }),
    },
  };

  const elIconTerminal = (
    <Icons.Terminal color={COL_ICON.TERMINAL} style={styles.left.icon} size={20} />
  );
  const elArrow = <Icons.Arrow.Forward size={20} color={COL_ICON.PENDING} />;
  const elKeyboard = <Icons.Keyboard size={20} color={COL_ICON.EMPTY} />;
  const elIcon = input ? elArrow : elKeyboard;

  const elRight = (
    <Button isEnabled={isInvokable}>
      <div {...styles.right.base}>{elIcon}</div>
    </Button>
  );

  const elTextbox = (
    <div {...styles.textbox.base}>
      <TextInput
        style={styles.textbox.input}
        value={text}
        placeholder={props.placeholder ?? DEFAULT.PLACEHOLDER}
        valueStyle={{ color: COL_TEXT.VALUE, fontSize: 12 }}
        placeholderStyle={{ italic: true, color: COL_TEXT.PLACEHOLDER }}
        spellCheck={false}
        selectOnFocus={true}
        onChange={(e) => {
          setText(e.to);
          setPending(true);
        }}
        onEnter={() => {
          const text = input;
          if (text) props.onAction?.({ text });
          setPending(false);
        }}
      />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elIconTerminal}
      {elTextbox}
      {elRight}
    </div>
  );
};
