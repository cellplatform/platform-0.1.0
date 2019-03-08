import * as React from 'react';
import { css, color } from '../common';

export { Button, ObjectView } from '@uiharness/electron/lib/components';
export * from '@platform/ui.text/lib/components/TextInput';
export * from '@platform/ui.text/lib/components/Text';

/**
 * [Html] elements.
 */
export const Hr = (props: { color?: string | number; margin?: number } = {}) => {
  const { margin = 20 } = props;
  const styles = {
    base: css({
      border: 'none',
      borderBottom: `solid 1px ${color.format(props.color || -0.1)}`,
      MarginY: margin,
    }),
  };
  return <hr {...styles.base} />;
};
