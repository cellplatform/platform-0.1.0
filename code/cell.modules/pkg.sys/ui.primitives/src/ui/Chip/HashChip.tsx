import React from 'react';

import { FC, Color, css, CssValue, copyToClipboard, Icons, Button, t, THEMES } from './common';
import { View as Chip, height } from './Chip.View';

const DEFAULT = { LENGTH: 6 };

/**
 * Types
 */
type HashValue = string;
type ClipboardText = (e: ClipboardTextArgs) => string;
type ClipboardTextArgs = { hash: string; text: string; algorithm: string };

export type HashChipProps = {
  text?: HashValue;
  length?: number;
  clipboard?: boolean | ClipboardText;
  inline?: boolean;
  icon?: boolean;
  prefix?: string | null;
  prefixColor?: string | number;
  theme?: t.ChipTheme;
  style?: CssValue;
};

/**
 * Component
 */
export const View: React.FC<HashChipProps> = (props) => {
  const { clipboard = true, icon, prefixColor } = props;
  const length = Math.max(5, props.length ?? DEFAULT.LENGTH);
  const hash = parseHash(props.text || '');
  const text = hash.text ? hash.text.substring(hash.text.length - length) : '';

  const algorithm = hash.algorithm.toUpperCase();
  let prefix = algorithm;
  if (props.prefix === null) prefix = '';
  if (typeof props.prefix === 'string') prefix = props.prefix;

  const handleClipboardClick = () => {
    const args = hash.toClipboard();
    const value = typeof props.clipboard === 'function' ? props.clipboard(args) : args.hash;
    copyToClipboard(value);
  };

  /**
   * [Render]
   */
  const styles = {
    hashPrefix: css({ color: Color.format(prefixColor) }),
  };

  const elIcon = icon && <Icons.QRCode size={height} />;
  const elHashPrefix = prefix && <div {...css(styles.hashPrefix)}>{prefix}</div>;
  const elHashText = text && (
    <div>
      {clipboard && <Button onClick={handleClipboardClick}>{text}</Button>}
      {!clipboard && text}
    </div>
  );

  return (
    <Chip
      tooltip={hash.tooltip}
      empty={'No Hash'}
      body={[elHashPrefix, elHashText]}
      prefix={elIcon}
      inline={props.inline}
      theme={props.theme}
      style={props.style}
    />
  );
};

/**
 * Helpers
 */

export function parseHash(hash: string) {
  const parts = (hash || '').split('-');
  const algorithm = parts.length > 1 ? parts[0] : '';
  const text = parts.length > 1 ? parts[1] : parts[0];

  let tooltip = '';
  if (text) {
    tooltip = 'Hash';
    if (algorithm) tooltip = `${tooltip} (${algorithm.toUpperCase()})`;
    tooltip = `${tooltip}:\n${text}`;
  }

  return {
    text,
    algorithm,
    tooltip,
    toString: () => hash,
    toClipboard(): ClipboardTextArgs {
      return { hash, text, algorithm };
    },
  };
}

/**
 * Export
 */

type Fields = {
  THEMES: typeof THEMES;
};
export const HashChip = FC.decorate<HashChipProps, Fields>(
  View,
  { THEMES },
  { displayName: 'HashChip' },
);
