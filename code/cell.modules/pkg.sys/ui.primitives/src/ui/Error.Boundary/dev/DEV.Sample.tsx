import React from 'react';

import { color, css, CssValue } from '../../common';
import { Text } from '../../Text';

export type DevSampleProps = {
  throw?: boolean;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  if (props.throw) {
    throw new Error('My Sample Error');
  }

  /**
   * [Render]
   */
  const styles = {
    base: css({ flex: 1, Flex: 'center-center' }),
    body: css({ minWidth: 300 }),
    title: css({
      borderBottom: `solid 5px ${color.format(-0.1)}`,
      paddingBottom: 8,
      marginBottom: 8,
      textAlign: 'center',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.title}>
          <Text.Syntax fontSize={22} monospace={true} fontWeight={'bold'} text={`<MyComponent>`} />
        </div>
      </div>
    </div>
  );
};
