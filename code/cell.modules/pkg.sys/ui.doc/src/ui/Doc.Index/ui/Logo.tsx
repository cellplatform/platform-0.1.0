import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type LogoProps = { style?: CssValue };

/**
 * TODO 🐷
 * - make generic, not hard coded to initial "sample" exercise.
 */
export const Logo: React.FC<LogoProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: [10, null, null, 10],
      color: COLORS.DARK,
      letterSpacing: -0.1,
      fontSize: 18,
      userSelect: 'none',
    }),
    subdomain: css({ color: COLORS.RED }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <span {...styles.subdomain}>ro</span>.db.team
    </div>
  );
};
