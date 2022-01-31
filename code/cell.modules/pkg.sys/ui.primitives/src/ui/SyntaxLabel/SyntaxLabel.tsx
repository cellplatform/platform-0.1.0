import React, { useMemo } from 'react';

import { css, CssValue, style, t } from '../../common';
import { DefaultTokenizer } from './Tokenizer';
import * as k from './types';

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
  const { text = '', inlineBlock = true, tokenizer = DefaultTokenizer } = props;
  const tokens = useMemo(() => tokenizer(text).parts, [tokenizer, text]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: inlineBlock && 'inline-block',
      ...style.toPadding(props.padding),
      ...style.toMargins(props.margin),
    }),
  };

  const elements = tokens.map((token, i) => {
    return (
      <span key={i} style={{ color: token.color }}>
        {token.text}
      </span>
    );
  });

  return <div {...css(styles.base, props.style)}>{elements}</div>;
};