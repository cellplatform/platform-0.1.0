import React, { useMemo } from 'react';

import { color, constants, css, FC, Style } from './common';
import { THEMES, DEFAULT } from './common.const';
import { DefaultTokenizer } from './logic/Tokenizer';
import { TextSyntaxProps } from './types';
import { Util } from './Util';

export { TextSyntaxProps };

/**
 * Label that provides common syntax highlighting.
 */
const View: React.FC<TextSyntaxProps> = (props) => {
  const {
    inlineBlock = true,
    ellipsis = true,
    tokenizer = DefaultTokenizer,
    theme = DEFAULT.THEME,
    fontSize,
    fontWeight,
    monospace = false,
  } = props;

  const colors = {
    ...(theme === 'Light' ? DEFAULT.LIGHT : DEFAULT.DARK),
    ...props.colors,
  };

  let text = props.text ?? '';
  if (typeof props.children === 'string') {
    if (text) text += ' ';
    text += props.children;
  }

  const tokens = useMemo(() => tokenizer(text).parts, [tokenizer, text]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: inlineBlock && 'inline-block',
      fontSize,
      fontWeight,
      fontFamily: monospace ? 'monospace' : undefined,
      ...Style.toPadding(props.padding),
      ...Style.toMargins(props.margin),
    }),
    ellipsis:
      ellipsis &&
      css({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
  };

  const elements = tokens.map((token, i) => {
    const style = { color: color.format(Util.toColor(colors, tokens, i)) };
    return (
      <span key={i} style={style}>
        {token.text}
      </span>
    );
  });

  return <div {...css(styles.base, styles.ellipsis, props.style)}>{elements}</div>;
};

/**
 * Export
 */
type Fields = {
  THEMES: typeof THEMES;
  DEFAULT: typeof DEFAULT;
};
export const TextSyntax = FC.decorate<TextSyntaxProps, Fields>(
  View,
  { THEMES, DEFAULT },
  { displayName: 'TextSyntax' },
);
