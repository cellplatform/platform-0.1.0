import React from 'react';

import { COLORS, css, CssValue, FONT, Font, SanitizeHtml } from './common';

export type DocHeadlineProps = {
  category?: string;
  title?: string;
  subtitle?: string;
  style?: CssValue;
};

/**
 * REF: https://google-webfonts-helper.herokuapp.com/fonts/neuton?subsets=latin
 */
export const DocHeadline: React.FC<DocHeadlineProps> = (props) => {
  const { category } = props;

  const fonts = Font.useFont([FONT.NEUTON.REGULAR, FONT.NEUTON.ITALIC]);
  if (!fonts.ready) return null;

  const title = linebreaks(props.title);
  const subtitle = linebreaks(props.subtitle);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      color: COLORS.DARK,
      fontKerning: 'auto',
    }),
    category: css({
      color: '#E21B22', // Red (deep, rich).
      textTransform: 'uppercase',
      fontSize: 13,
      fontWeight: 700,
      marginBottom: title || subtitle ? 6 : 0,
    }),
    headline: css({
      fontFamily: 'Neuton',
      fontSize: 46,
      fontStyle: 'normal',
      letterSpacing: '-0.006em',
      lineHeight: '1em',
      marginBottom: subtitle ? 20 : 0,
    }),
    subtitle: css({
      fontSize: 22,
      opacity: 0.6,
      lineHeight: '1.4em',
    }),
  };

  const elCategory = category && <div {...styles.category}>{category}</div>;
  const elTitle = title && <SanitizeHtml style={styles.headline} html={title} />;
  const elSubtitle = subtitle && <SanitizeHtml style={styles.subtitle} html={subtitle} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elCategory}
      {elTitle}
      {elSubtitle}
    </div>
  );
};

/**
 * Helpers
 */

function linebreaks(input?: string) {
  return (input || '').trim().replace(/^\n*/, '').replace(/\n*$/, '').replace(/\n/g, '<br>');
}
