import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, style } from '../../common';
import * as k from './types';

import { DefaultTokenizer } from './Tokenizer';

export type SyntaxLabelProps = {
  text?: string;
  style?: CssValue;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  tokenizer?: k.SyntaxLabelTokenizer;
};

/**
 * Label that provides common syntax highlighting.
 */
export const SyntaxLabel: React.FC<SyntaxLabelProps> = (props) => {
  const { inlineBlock = true, tokenizer = DefaultTokenizer } = props;
  const tokens = tokenizer(props.text ?? '').parts;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: inlineBlock && 'inline-block',
      ...style.toPadding(props.padding),
      ...style.toMargins(props.margin),
    }),
    token: css({}),
  };

  const elements = tokens.map((token, i) => {
    return (
      <span key={i} {...styles.token} style={{ color: token.color }}>
        {token.text}
      </span>
    );
  });

  return <div {...css(styles.base, props.style)}>{elements}</div>;
};
