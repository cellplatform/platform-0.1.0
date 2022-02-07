import React from 'react';
import { color, css, COLORS, CssValue, t, Icons, Text } from './DEV.common';

export type PeerLabelProps = {
  id: string;
  style?: CssValue;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  const PREDICATE = 'peer';
  const uri = `${PREDICATE}:${props.id}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'x-center-start',
    }),
    icon: css({ marginRight: 6 }),
    label: {
      base: css({
        position: 'relative',
        top: -2,
        fontFamily: 'monospace',
        fontSize: 11,
        fontWeight: 600,
      }),
      predicate: css({ color: COLORS.MAGENTA }),
      value: css({ color: COLORS.CYAN_BLUE }),
    },
  };

  const elLabel = (
    <div>
      <Text.Copy copyToClipboard={(e) => e.copy(uri)}>
        <span {...styles.label.predicate}>{PREDICATE}:</span>
        <span {...styles.label.value}>{props.id}</span>
      </Text.Copy>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Icons.Face style={styles.icon} size={22} />
      <div {...styles.label.base}>{elLabel}</div>
    </div>
  );
};
