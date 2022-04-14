import React, { useMemo } from 'react';

import { color, constants, css, DEFAULT, FC, Style } from './common';
import { DefaultTokenizer } from './logic/Tokenizer';
import { TextSyntaxProps } from './types';
import { Util } from './Util';

export { TextSyntaxProps };

/**
 * Label that provides common syntax highlighting.
 */
const View: React.FC<TextSyntaxProps> = (props) => {
  const {
    children,
    inlineBlock = true,
    ellipsis = true,
    tokenizer = DefaultTokenizer,
    theme = DEFAULT.THEME,
    fontSize,
    fontWeight,
    monospace = false,
  } = props;

  const colors = {
    ...(theme === 'Light' ? constants.COLORS.LIGHT : constants.COLORS.DARK),
    ...props.colors,
  };

  let text = props.text ?? '';
  if (typeof children === 'string') {
    if (text) text += ' ';
    text += children;
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
  constants: typeof constants;
};
export const TextSyntax = FC.decorate<TextSyntaxProps, Fields>(
  View,
  { constants },
  { displayName: 'TextSyntax' },
);
