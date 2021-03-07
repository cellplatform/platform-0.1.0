import React from 'react';
import { css, CssValue } from '../common';

export type FooProps = { style?: CssValue };

export const Foo: React.FC<FooProps> = (props) => {
  const styles = {
    base: css({
      padding: 30,
    }),
  };
  return <div {...css(styles.base, props.style)}>Hello Foo 👋</div>;
};

export default Foo;
