import * as React from 'react';
import { css } from '../common';

export const Test = () => {
  const styles = {
    base: css({ padding: 30 }),
  };

  const data = {
    foo: 123,
    bar: [1, 2, 3],
    baz: {
      text: 'hello',
      number: 123,
      flag: true,
      date: new Date(),
      null: null,
      undefined: undefined,
    },
  };

  return (
    <div {...styles.base}>
      <div />
    </div>
  );
};
