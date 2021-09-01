import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';

export type FooProps = {
  src?: string;
  style?: CssValue;
};

export const Foo: React.FC<FooProps> = (props) => {
  const { src } = props;

  console.log('src', src);

  const styles = {
    base: css({
      flex: 1,
      display: 'grid',
      justifyContent: 'center',
      alignContent: 'center',
      fontSize: 50,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div>Foo</div>
      <img src={src} />
    </div>
  );
};
