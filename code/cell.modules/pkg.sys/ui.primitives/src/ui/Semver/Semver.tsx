import React from 'react';

import { color, COLORS, css, t } from '../../common';

export type SemverProps = {
  version?: string;
  style?: t.CssValue;
};

export const Semver: React.FC<SemverProps> = (props) => {
  const text = props.version;
  if (!text) return null;

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
