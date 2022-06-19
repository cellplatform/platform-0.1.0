import React from 'react';
import { css, CssValue } from '../common';

export type EmptyProps = {
  text?: React.ReactNode;
  style?: CssValue;
};

export const Empty: React.FC<EmptyProps> = (props) => {
  const { text = 'No events to display' } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ flex: 1, display: 'flex', Flex: 'y-stretch-center', padding: 10 }),
    label: css({ fontSize: 12, fontStyle: 'italic', opacity: 0.4 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.label}>{text}</div>
    </div>
  );
};
