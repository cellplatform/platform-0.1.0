import React, { useEffect, useRef, useState } from 'react';
import { Card, color, COLORS, css, CssValue, TextSyntax, t } from './DEV.common';
import { DevKey, DevKeyDefaults } from './DEV.Key';

export type DevModifierKeysProps = {
  align?: 'left' | 'right';
  spacing?: number;
  style?: CssValue;
};

export const DevModifierKeys: React.FC<DevModifierKeysProps> = (props) => {
  const { align = 'left', spacing = DevKeyDefaults.SPACING } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
      boxSizing: 'border-box',
    }),
    row: css({
      Flex: align === 'left' ? 'x-start-start' : 'x-end-end',
      marginBottom: spacing,
      ':last-child': { marginBottom: 0 },
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.row}>
        <DevKey label={'Shift'} paddingX={30} />
      </div>
      <div {...styles.row}>
        <DevKey label={'Ctrl'} />
        <DevKey label={'Alt'} />
        <DevKey label={'Meta'} />
      </div>
    </div>
  );
};
