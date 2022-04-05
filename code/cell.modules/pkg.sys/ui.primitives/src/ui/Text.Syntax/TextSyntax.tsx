import React, { useMemo } from 'react';

import { FC, css, Style, t, constants, color, DEFAULT } from './common';
import { DefaultTokenizer } from './Tokenizer';

import { TextSyntaxProps } from './types';
export { TextSyntaxProps };

/**
 * Label that provides common syntax highlighting.
 */
const View: React.FC<TextSyntaxProps> = (props) => {
  const {
    text = '',
    inlineBlock = true,
    ellipsis = true,
    tokenizer = DefaultTokenizer,
    theme = DEFAULT.THEME,
  } = props;

  const colors = {
    ...(theme === 'Light' ? constants.COLORS.LIGHT : constants.COLORS.DARK),
    ...props.colors,
  };

  const tokens = useMemo(() => tokenizer(text).parts, [tokenizer, text]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: inlineBlock && 'inline-block',
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
    const style = { color: color.format(toColor(colors, token)) };
    return (
      <span key={i} style={style}>
        {token.text}
      </span>
    );
  });

  return <div {...css(styles.base, styles.ellipsis, props.style)}>{elements}</div>;
};

/**
 * [Helpers]
 */

function toColor(colors: t.TextSyntaxColors, token: t.TextSyntaxToken) {
  if (token.kind === 'Word') return token.within ? colors.Word.Element : colors.Word.Base;
  return colors[token.kind];
}

/**
 * Export
 */
type Fields = {
  constants: typeof constants;
};
export const TextSyntax = FC.decorate<TextSyntaxProps, Fields>(
  View,
  { constants },
  { displayName: 'TextSyntax' },
);
