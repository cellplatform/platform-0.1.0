import React, { useMemo } from 'react';

import { css, CssValue, Style, t, COLORS, color } from '../../common';
import { DefaultTokenizer } from './Tokenizer';
import * as k from './types';

export type TextSyntaxProps = {
  text?: string;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  tokenizer?: k.SyntaxLabelTokenizer;
  style?: CssValue;
};

const SYNTAX_COLORS: k.SyntaxLabelColors = {
  Brace: COLORS.MAGENTA,
  Predicate: COLORS.MAGENTA,
  Word: COLORS.CYAN,
  Colon: color.alpha(COLORS.DARK, 0.6),
};

/**
 * Label that provides common syntax highlighting.
 */
export const TextSyntax: React.FC<TextSyntaxProps> = (props) => {
  const { text = '', inlineBlock = true, tokenizer = DefaultTokenizer } = props;
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
  };

  const elements = tokens.map((token, i) => {
    return (
      <span key={i} style={{ color: SYNTAX_COLORS[token.kind] }}>
        {token.text}
      </span>
    );
  });

  return <div {...css(styles.base, props.style)}>{elements}</div>;
};
