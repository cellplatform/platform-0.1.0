import * as React from 'react';
import { css } from '../common';

export const Test = () => {
  const styles = {
    base: css({ padding: 30 }),
  };

  return (
    <div {...styles.base}>
      Text
      <div />
    </div>
  );
};
