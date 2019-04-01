import * as React from 'react';
import { css, ObjectView, constants } from './common';

export const Test = () => {
  const styles = {
    base: css({
      Flex: 'vertical',
      Absolute: 0,
    }),
    top: css({
      flex: 1,
      padding: 30,
    }),
    bottom: css({
      flex: 1,
      padding: 30,
      backgroundColor: constants.COLORS.DARK,
    }),
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
      <div {...styles.top}>
        <ObjectView name={'custom name'} data={data} expandLevel={5} />
      </div>
      <div {...styles.bottom}>
        <ObjectView name={'custom name'} data={data} expandLevel={5} theme={'DARK'} />
      </div>
    </div>
  );
};
