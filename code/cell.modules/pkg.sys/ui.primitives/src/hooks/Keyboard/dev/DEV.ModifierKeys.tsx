import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t } from './DEV.common';
import { DevKey, DevKeyDefaults } from './DEV.Key';

export type DevModifierKeysProps = {
  edge: 'Left' | 'Right';
  state: t.KeyboardState;
  spacing?: number;
  style?: CssValue;
};

export const DevModifierKeys: React.FC<DevModifierKeysProps> = (props) => {
  const { edge, state, spacing = DevKeyDefaults.SPACING } = props;

  type P = { isPressed: boolean; isEdge: boolean };
  const toPressed = (state: t.KeyboardModifierKeyState): P => {
    if (state === false) return { isPressed: false, isEdge: false };
    return {
      isPressed: Array.isArray(state),
      isEdge: (state as string[]).includes(edge),
    };
  };

  const shift = toPressed(state.modifiers.shift);
  const ctrl = toPressed(state.modifiers.ctrl);
  const alt = toPressed(state.modifiers.alt);
  const meta = toPressed(state.modifiers.meta);

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
      Flex: edge === 'Left' ? 'x-start-start' : 'x-end-end',
      marginBottom: spacing,
      ':last-child': { marginBottom: 0 },
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.row}>
        <DevKey label={'Shift'} paddingX={30} {...shift} />
      </div>
      <div {...styles.row}>
        <DevKey label={'Ctrl'} {...ctrl} />
        <DevKey label={'Alt'} {...alt} />
        <DevKey label={'Meta'} {...meta} />
      </div>
    </div>
  );
};
