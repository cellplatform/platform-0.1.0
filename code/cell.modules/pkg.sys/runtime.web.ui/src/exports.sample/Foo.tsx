import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, FC } from '../common';

export type FooProps = { style?: CssValue };

export const Foo: React.FC<FooProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      Flex: 'center-center',
      fontSize: 30,
    }),
  };
  return <div {...css(styles.base, props.style)}>Foo 🐷</div>;
};

/**
 * Default entry function (sample).
 */
const entry: t.ModuleDefaultEntry = (bus, ctx) => {
  console.group('🌳 ModuleDefaultEntry');
  console.log('bus', bus);
  console.log('ctx', ctx);
  console.groupEnd();

  return <Foo />;
};

export default entry;
