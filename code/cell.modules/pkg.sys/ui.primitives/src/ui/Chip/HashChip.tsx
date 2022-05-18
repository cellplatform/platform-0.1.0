import React from 'react';

import { Color, css, CssValue, copyToClipboard, Icons, Button } from './common';
import { View, height } from './Chip.View';

type HashValue = string;

const DEFAULT = { LENGTH: 6 };

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
  style?: CssValue;
};

export const HashChip: React.FC<HashChipProps> = (props) => {
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
    <View
      tooltip={hash.tooltip}
      empty={'No Hash'}
      body={[elHashPrefix, elHashText]}
      prefix={elIcon}
      inline={props.inline}
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
