import React from 'react';
import { css, CssValue, t } from '../common';

export type FooProps = { title: string; style?: CssValue };

export const Foo: React.FC<FooProps> = (props) => {
  const styles = {
    base: css({
      Absolute: 0,
      fontSize: 30,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      Flex: 'center-center',
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.title}</div>;
};

/**
 * Default entry function (sample).
 */
const entry: t.ModuleDefaultEntry = (pump, ctx) => {
  return <Foo title={'Foo 🐷'} />;
};

export default entry;
