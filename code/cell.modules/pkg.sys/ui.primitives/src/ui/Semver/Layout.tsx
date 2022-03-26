import React from 'react';

import { color, COLORS, css, t } from '../../common';

export type LayoutProps = t.SemverProps;

export const Layout: React.FC<LayoutProps> = (props) => {
  const text = props.version || '-.-.-';

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      display: 'inline-block',
    }),
    text: css({
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: color.alpha(COLORS.DARK, 1),
      letterSpacing: -0.5,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.text}>{text}</div>
    </div>
  );
};
