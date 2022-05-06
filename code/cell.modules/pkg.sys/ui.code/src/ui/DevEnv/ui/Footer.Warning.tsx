import React from 'react';
import { COLORS, css, CssValue, Icons } from '../common';

export type FooterWarningProps = { style?: CssValue };

export const FooterWarning: React.FC<FooterWarningProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      padding: 6,
      backgroundColor: COLORS.CLI.YELLOW,
      Flex: 'horizontal-spaceBetween-center',
    }),
    warning: {
      base: css({ Flex: 'horizontal-center-center', fontSize: 11 }),
      icon: css({ marginRight: 6, opacity: 0.6 }),
      label: css({ opacity: 0.7 }),
    },
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.warning.base}>
        <Icons.Warning style={styles.warning.icon} size={18} color={COLORS.DARK} />
        <div {...styles.warning.label}>
          Warning: Unsafe {`"eval"`} language structure in use. Do not use in production.
        </div>
      </div>
      <div></div>
    </div>
  );
};
