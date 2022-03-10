import React from 'react';

import { Card, color, COLORS, css, CssValue, TextSyntax } from './DEV.common';

export const DevKeyDefaults = { SPACING: 4 };

export type DevKeyProps = {
  label?: string | JSX.Element;
  pressed?: boolean;
  spacing?: number;
  paddingX?: number;
  style?: CssValue;
};

export const DevKey: React.FC<DevKeyProps> = (props) => {
  const { label = '?', pressed = false, paddingX = 12, spacing = DevKeyDefaults.SPACING } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
      marginRight: spacing,
      ':last-child': { marginRight: 0 },
    }),
    bg: css({
      Absolute: 0,
      backgroundColor: pressed ? color.alpha(COLORS.DARK, 0.8) : undefined,
    }),
    body: css({
      position: 'relative',
      padding: [5, paddingX, 7, paddingX],
    }),
    label: css({
      fontFamily: 'monospace',
      fontWeight: 'bold',
      fontSize: 13,
    }),
  };

  const elLabel =
    typeof label === 'string' ? (
      <TextSyntax
        text={`<${label}>`}
        colors={pressed ? { Brace: 0.8, Word: 1 } : undefined}
        style={styles.label}
      />
    ) : (
      label
    );

  return (
    <Card style={css(styles.base, props.style)}>
      <div {...styles.bg} />
      <div {...styles.body}>{elLabel}</div>
    </Card>
  );
};
