import React, { useState } from 'react';

import { Button } from '../../ui.ref/button/Button';
import { Spinner } from '../../ui.ref/spinner/Spinner';
import { color, COLORS, css, CssValue, t } from '../common';
import { Icons } from '../Icons';
import { TextInput } from '../Text.Input';

/**
 * Types
 */
export type CmdTextboxProps = {
  text?: string; // NB: undefined === handle state internally ("uncontrolled").
  placeholder?: string;
  spinner?: boolean;
  pending?: boolean;
  theme?: t.CmdTextboxTheme;
  style?: CssValue;
  onChange?: t.CmdTextboxChangeEventHandler;
  onAction?: t.CmdTextboxActionEventHandler;
};

/**
 * Constants
 */
const THEMES: t.CmdTextboxTheme[] = ['Light', 'Dark'];
const DEFAULT_THEME: t.CmdTextboxTheme = 'Light';
const DEFAULT = {
  THEME: DEFAULT_THEME,
  PLACEHOLDER: 'command',
};
export const CmdTextboxContants = { DEFAULT, THEMES };

/**
 * Component
 */
export const CmdTextbox: React.FC<CmdTextboxProps> = (props) => {
  const { theme = 'Light', spinner, pending = false } = props;
  const isControlled = typeof props.text === 'string';

  const [textState, setTextState] = useState('');
  const text = isControlled ? props.text : textState;
  const textTrimmed = (text || '').trim();

  const isInvokable = Boolean(textTrimmed && pending);
  const isDark = theme === 'Dark';

  const COL_BASE = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_HIGHLIGHT = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_ICON = {
    PENDING: Boolean(textTrimmed && !pending) ? COL_HIGHLIGHT : color.alpha(COL_BASE, 0.8),
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
    base: css({ minWidth: 240, color: COL_BASE, Flex: 'x-stretch-stretch' }),
    textbox: {
      base: css({ flex: 1, Flex: 'x-center-center' }),
      input: css({
        position: 'relative',
        flex: 1,
        top: -5,
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
    spinner: css({ top: -2 }),
  };

  const elLeft = (
    <div {...styles.left.base}>
      <Icons.Terminal color={COL_ICON.TERMINAL} style={styles.left.icon} size={20} />
    </div>
  );

  const elSpinner = spinner && (
    <Spinner size={18} color={isDark ? COLORS.WHITE : COLORS.DARK} style={styles.spinner} />
  );

  const elActionIcon = pending && !elSpinner && (
    <Button isEnabled={isInvokable}>
      <Icons.Arrow.Forward size={20} color={COL_ICON.PENDING} />
    </Button>
  );
  const elRight = <div {...styles.right.base}>{elSpinner || elActionIcon}</div>;

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
          const { from, to } = e;
          if (!isControlled) setTextState(to);
          props.onChange?.({ from, to });
        }}
        onEnter={() => {
          const text = textTrimmed;
          if (text) props.onAction?.({ text, kind: 'Key:Enter' });
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
