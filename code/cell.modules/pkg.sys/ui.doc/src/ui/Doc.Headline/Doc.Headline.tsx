import React from 'react';

import { COLORS, css, CssValue, FONT, Font, SanitizeHtml, Button } from './common';

export type DocHeadlineProps = {
  id?: string;
  category?: string;
  title?: string;
  subtitle?: string;
  style?: CssValue;
  onClick?: (e: { id: string; title: string }) => void;
};

/**
 * REF: https://google-webfonts-helper.herokuapp.com/fonts/neuton?subsets=latin
 */
export const DocHeadline: React.FC<DocHeadlineProps> = (props) => {
  const { id = '', category, onClick } = props;

  const fonts = Font.useFont([FONT.NEUTON.REGULAR, FONT.NEUTON.ITALIC]);
  if (!fonts.ready) return null;

  const title = linebreaks(props.title);
  const subtitle = linebreaks(props.subtitle);

  /**
   * Handlers
   */
  const handleClick = () => onClick?.({ id, title });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      fontKerning: 'auto',
      cursor: props.onClick ? 'pointer' : 'default',
    }),
    category: css({
      color: '#E21B22', // Red (deep, rich).
      textTransform: 'uppercase',
      fontSize: 13,
      fontWeight: 700,
      marginBottom: title || subtitle ? 6 : 0,
      userSelect: 'none',
    }),
    displayFont: {
      color: COLORS.DARK,
      fontFamily: 'Neuton',
      fontStyle: 'normal',
      letterSpacing: '-0.006em',
    },
    headline: css({
      fontSize: 46,
      marginBottom: subtitle ? 20 : 0,
      lineHeight: 0.9,
    }),
    subtitle: css({
      fontSize: 28,
      opacity: 0.6,
      lineHeight: 1.15,
      letterSpacing: '-0.006em',
    }),
  };

  const elCategory = category && <div {...styles.category}>{category}</div>;
  const elTitle = title && (
    <SanitizeHtml style={css(styles.headline, styles.displayFont)} html={title} />
  );
  const elSubtitle = subtitle && (
    <SanitizeHtml style={css(styles.subtitle, styles.displayFont)} html={subtitle} />
  );

  const elements = (
    <>
      {elCategory}
      {elTitle}
      {elSubtitle}
    </>
  );

  const elButtonElements = <Button onClick={() => handleClick()}>{elements}</Button>;

  return (
    <div {...css(styles.base, props.style)}>{Boolean(onClick) ? elButtonElements : elements}</div>
  );
};

/**
 * Helpers
 */

function linebreaks(input?: string) {
  return (input || '').trim().replace(/^\n*/, '').replace(/\n*$/, '').replace(/\n/g, '<br>');
}