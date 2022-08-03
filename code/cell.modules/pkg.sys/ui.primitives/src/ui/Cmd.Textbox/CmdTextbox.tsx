import React from 'react';

import { Button } from '../../ui.ref/button/Button';
import { Spinner } from '../Spinner';
import { color, COLORS, css, CssValue, t } from '../common';
import { Icons } from '../Icons';
import { TextInput } from '../Text.Input';

/**
 * Types
 */
export type CmdTextboxProps = {
  instance?: { bus: t.EventBus<any>; id: string };
  text?: string;
  hint?: string;
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

  const text = props.text ?? '';
  const textTrimmed = text.trim();

  const isInvokable = Boolean(textTrimmed && pending);
  const isDark = theme === 'Dark';

  const COL_BASE = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_HIGHLIGHT = isDark ? COLORS.WHITE : COLORS.DARK;
  const COL_ICON = {
    PENDING: Boolean(textTrimmed && !pending) ? COL_HIGHLIGHT : color.alpha(COL_BASE, 0.8),
    TERMINAL: isDark ? COLORS.WHITE : color.alpha(COL_BASE, 0.8),
  };
  const COL_TEXT = {
    DEFAULT: color.alpha(COL_BASE, 0.9),
    PENDING: COL_BASE,
    PLACEHOLDER: isDark ? 0.3 : -0.3,
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      minWidth: 240,
      color: COL_BASE,
      Flex: 'x-center-stretch',
    }),
    left: css({}),
    middle: css({
      flex: 1,
      position: 'relative',
      marginLeft: 4,
    }),
    right: css({
      position: 'relative',
      Flex: 'x-center-center',
    }),
    spinner: css({ position: 'relative' }),
  };

  const elLeft = <Icons.Terminal color={COL_ICON.TERMINAL} size={20} />;

  const elSpinner = spinner && (
    <Spinner size={18} color={isDark ? COLORS.WHITE : COLORS.DARK} style={styles.spinner} />
  );

  const elActionIcon = pending && !elSpinner && (
    <Button isEnabled={isInvokable} style={{ height: 20 }}>
      <Icons.Arrow.Forward size={20} color={COL_ICON.PENDING} />
    </Button>
  );
  const elRight = <div {...styles.right}>{elSpinner || elActionIcon}</div>;

  const elMiddle = (
    <div {...styles.middle}>
      <TextInput
        instance={props.instance}
        value={text}
        hint={props.hint}
        placeholder={props.placeholder ?? DEFAULT.PLACEHOLDER}
        valueStyle={{
          color: pending ? COL_TEXT.PENDING : COL_TEXT.DEFAULT,
          fontSize: 14,
        }}
        placeholderStyle={{
          color: COL_TEXT.PLACEHOLDER,
          italic: true,
        }}
        spellCheck={false}
        focusAction={'Select'}
        onChange={(e) => {
          const { from, to } = e;
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
      {elMiddle}
      {elRight}
    </div>
  );
};
