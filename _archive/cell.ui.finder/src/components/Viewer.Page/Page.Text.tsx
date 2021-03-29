import * as React from 'react';
import { Text, ITextProps } from '../primitives';
import { css, COLORS, color } from '../../common';

export { ITextProps };

type P = ITextProps;

export const Headline = (props: P) => {
  const style = css({
    fontWeight: 'bold',
    fontSize: 38,
    color: color.format(-0.9),
    marginBottom: 20,
    letterSpacing: '-0.8px',
  });
  return <Text {...props} style={css(style, props.style)} />;
};

export const Paragraph = (props: P) => {
  const styles = {
    text: css({
      lineHeight: '1.6em',
      fontSize: 15,
      marginBottom: 20,
    }),
  };
  return <Text {...props} style={css(styles.text, props.style)} />;
};

export const PageText = {
  Headline,
  Paragraph,
};
