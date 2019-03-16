import '@babel/polyfill';
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
        <Spinner size={'SMALL'} />
        <Spinner size={'MEDIUM'} />
        <Spinner size={'LARGE'} />
      </div>
      <div {...css(styles.spinners, styles.inverted)}>
        <Spinner size={'SMALL'} color={1} />
        <Spinner size={'MEDIUM'} color={1} />
        <Spinner size={'LARGE'} color={1} />
      </div>
    </div>
  );
};
