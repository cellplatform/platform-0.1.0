import React, { useState } from 'react';
import { TextInput, color, COLORS, css, CssValue, Icons, Button, Spinner } from '../common';

/**
 * Types
 */
export type CommandTextboxTheme = 'Dark' | 'Light';

export type CommandTextboxActionEvent = { text: string };
export type CommandTextboxActionEventHandler = (e: CommandTextboxActionEvent) => void;

export type CommandTextboxChangeEvent = { text: string };
export type CommandTextboxChangeEventHandler = (e: CommandTextboxChangeEvent) => void;

export type CommandTextboxProps = {
  placeholder?: string;
  spinner?: boolean;
  theme?: CommandTextboxTheme;
  style?: CssValue;
  onChange?: CommandTextboxChangeEventHandler;
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
  const { theme = 'Light', spinner } = props;

  const [pending, setPending] = useState(false);
  const [text, setText] = useState('');
  const input = (text || '').trim();

  const isInvokable = Boolean(input && pending);
  const isDark = theme === 'Dark';

  const COL_BASE = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_HIGHLIGHT = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_ICON = {
    PENDING: Boolean(input && !pending) ? COL_HIGHLIGHT : color.alpha(COL_BASE, 0.8),
    TERMINAL: isDark ? COLORS.WHITE : color.alpha(COL_BASE, 0.8),
  };
  const COL_TEXT = {
    DEFAULT: color.alpha(COL_BASE, 0.5),
    PENDING: COL_BASE,
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
      base: css({}),
      icon: css({ position: 'relative', top: -2, marginRight: 4 }),
    },
    right: {
      base: css({
        top: -1,
        Flex: 'x-center-center',
        position: 'relative',
        marginLeft: 1,
      }),
      divider: css({ width: 4 }),
    },
  };

  const elLeft = (
    <div {...styles.left.base}>
      <Icons.Terminal color={COL_ICON.TERMINAL} style={styles.left.icon} size={20} />
    </div>
  );

  const elSpinner = spinner && <Spinner size={22} color={isDark ? COLORS.WHITE : COLORS.DARK} />;
  const elIcon = input && pending && !elSpinner && (
    <Button isEnabled={isInvokable}>
      <Icons.Arrow.Forward size={20} color={COL_ICON.PENDING} />
    </Button>
  );
  const elRight = <div {...styles.right.base}>{elSpinner || elIcon}</div>;

  const elTextbox = (
    <div {...styles.textbox.base}>
      <TextInput
        style={styles.textbox.input}
        value={text}
        placeholder={props.placeholder ?? DEFAULT.PLACEHOLDER}
        valueStyle={{
          color: pending ? COL_TEXT.PENDING : COL_TEXT.DEFAULT,
          fontSize: 12,
        }}
        placeholderStyle={{
          color: COL_TEXT.PLACEHOLDER,
          italic: true,
        }}
        spellCheck={false}
        selectOnFocus={true}
        onChange={(e) => {
          const text = e.to;
          setText(text);
          setPending(true);
          props.onChange?.({ text });
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
      {elLeft}
      {elTextbox}
      {elRight}
    </div>
  );
};
