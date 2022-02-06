import React from 'react';
import { color, css, COLORS, CssValue, t, Icons } from './DEV.common';

export type PeerLabelProps = {
  id: string;
  style?: CssValue;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'x-center-start',
    }),
    icon: css({ marginRight: 6 }),
    label: {
      base: css({ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }),
      predicate: css({ color: COLORS.MAGENTA }),
      value: css({ color: COLORS.CYAN_BLUE }),
    },
  };

  const elLabel = (
    <div>
      <span {...styles.label.predicate}>peer:</span>
      <span {...styles.label.value}>{props.id}</span>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Icons.Face style={styles.icon} size={22} />
      <div {...styles.label.base}>{elLabel}</div>
    </div>
  );
};
