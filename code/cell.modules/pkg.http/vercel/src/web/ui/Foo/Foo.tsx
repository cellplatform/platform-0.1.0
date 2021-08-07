import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type FooProps = { style?: CssValue };

export const Foo: React.FC<FooProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>Foo</div>;
};
