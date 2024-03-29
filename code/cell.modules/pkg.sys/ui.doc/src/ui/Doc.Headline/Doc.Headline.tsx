import React from 'react';
import { COLORS, css, CssValue, SanitizeHtml, Button, FONT } from './common';

export type DocHeadlineProps = {
  id?: string;
  category?: string;
  title?: string;
  subtitle?: string;
  hint?: { width?: number }; // Passed in if known, hints used to calculate headline/subtitle sizes.
  style?: CssValue;
  onClick?: (e: { id: string; title: string }) => void;
};

export const DocHeadline: React.FC<DocHeadlineProps> = (props) => {
  const { id = '', category, onClick, hint = {} } = props;
  const widthHint = hint.width ?? -1;

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
      marginBottom: title || subtitle ? 14 : 0,
      userSelect: 'none',
    }),
    displayFont: {
      color: COLORS.DARK,
      fontFamily: FONT.MERRIWEATHER.regular.normal.family,
      fontStyle: 'normal',
      letterSpacing: '-0.006em',
    },
    headline: css({
      fontSize: widthHint !== -1 && widthHint > 500 ? 46 : 32,
      marginBottom: subtitle ? 30 : 0,
      lineHeight: 1.1,
    }),
    subtitle: css({
      fontSize: widthHint !== -1 && widthHint > 500 ? 36 : 26,
      opacity: 0.4,
      lineHeight: 1.25,
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
