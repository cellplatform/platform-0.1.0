import React from 'react';

import { Card, color, COLORS, css, CssValue, TextSyntax } from './DEV.common';

export const DevKeyDefaults = { SPACING: 4 };

export type DevKeyProps = {
  label?: string | JSX.Element;
  isPressed?: boolean;
  isEdge?: boolean;
  spacing?: number;
  paddingX?: number;
  style?: CssValue;
};

export const DevKey: React.FC<DevKeyProps> = (props) => {
  const {
    label = '?',
    isPressed = false,
    isEdge = false,
    paddingX = 12,
    spacing = DevKeyDefaults.SPACING,
  } = props;

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
      backgroundColor: isPressed ? color.alpha(COLORS.DARK, 0.8) : undefined,
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
    edge: css({
      Absolute: [3, 3, null, null],
      Size: 5,
      borderRadius: 50,
      backgroundColor: COLORS.MAGENTA,
      border: `solid 1px ${color.format(0.7)}`,
    }),
  };

  const elLabel =
    typeof label === 'string' ? (
      <TextSyntax
        text={`<${label}>`}
        colors={isPressed ? { Brace: 0.8, Word: 1 } : undefined}
        style={styles.label}
      />
    ) : (
      label
    );

  return (
    <Card style={css(styles.base, props.style)}>
      <div {...styles.bg} />
      <div {...styles.body}>{elLabel}</div>
      {isPressed && isEdge && <div {...styles.edge} />}
    </Card>
  );
};
