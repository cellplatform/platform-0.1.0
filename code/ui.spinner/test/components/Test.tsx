import '@platform/libs/polyfill';
import '../../node_modules/@platform/css/reset.css';

import * as React from 'react';
import { css } from '../../src/common';
import { Spinner } from '../../src';

const DARK = '#293042';

export const Test = () => {
  const styles = {
    base: css({}),
    spinners: css({
      padding: 50,
      Flex: 'horizontal-center-spaceBetween',
    }),
    inverted: css({
      backgroundColor: DARK,
    }),
  };

  return (
    <div {...styles.base}>
      <div {...styles.spinners}>
        <Spinner size={12} />
        <Spinner size={18} />
        <Spinner size={22} />
        <Spinner size={32} />
      </div>
      <div {...css(styles.spinners, styles.inverted)}>
        <Spinner size={12} color={1} />
        <Spinner size={18} color={1} />
        <Spinner size={22} color={1} />
        <Spinner size={32} color={1} />
      </div>
    </div>
  );
};
