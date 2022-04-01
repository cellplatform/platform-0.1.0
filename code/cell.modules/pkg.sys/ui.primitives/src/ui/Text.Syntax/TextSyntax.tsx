import React, { useMemo } from 'react';

import { css, CssValue, Style, t, COLORS, color } from '../../common';
import { DefaultTokenizer } from './Tokenizer';
import * as k from './types';

/**
 * Types
 */
export type TextSyntaxProps = {
  text?: string;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  tokenizer?: k.TextSyntaxTokenizer;
  colors?: Partial<k.TextSyntaxColors>;
  style?: CssValue;
};

/**
 * Constants
 */
const BASE: k.TextSyntaxColors = {
  Brace: COLORS.MAGENTA,
  Predicate: COLORS.MAGENTA,
  Colon: color.alpha(COLORS.DARK, 0.6),
  Word: { Base: COLORS.DARK, Element: COLORS.CYAN },
};

/**
 * Label that provides common syntax highlighting.
 */
export const TextSyntax: React.FC<TextSyntaxProps> = (props) => {
  const { text = '', inlineBlock = true, tokenizer = DefaultTokenizer } = props;
  const tokens = useMemo(() => tokenizer(text).parts, [tokenizer, text]);
  const colors = { ...BASE, ...props.colors };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: inlineBlock && 'inline-block',
      ...Style.toPadding(props.padding),
      ...Style.toMargins(props.margin),
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

  return <div {...css(styles.base, props.style)}>{elements}</div>;
};

/**
 * [Helpers]
 */

function toColor(colors: k.TextSyntaxColors, token: k.TextSyntaxToken) {
  if (token.kind === 'Word') return token.within ? colors.Word.Element : colors.Word.Base;
  return colors[token.kind];
}
