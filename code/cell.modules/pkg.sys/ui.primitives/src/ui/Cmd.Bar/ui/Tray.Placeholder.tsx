import React from 'react';
import { color, css, CssValue } from '../common';

/**
 * Types
 */
export type TrayPlaceholderProps = {
  placeholder?: string;
  style?: CssValue;
};

/**
 * Component
 */
export const TrayPlaceholder: React.FC<TrayPlaceholderProps> = (props) => {
  const { placeholder = 'system tray' } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ minWidth: 140 }),
    body: css({
      Absolute: 6,
      border: `dashed 1px ${color.format(0.25)}`,
      borderRadius: 4,
      fontSize: 11,
      color: color.format(0.7),
      overflow: 'hidden',
      Flex: 'center-center',
    }),
    text: css({ opacity: 0.4 }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.text}>{placeholder}</div>
      </div>
    </div>
  );
};
