import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { ObjectView } from '../../ui/Primitives';

export type TestSuiteProps = {
  data?: any;
  style?: CssValue;
};

export const TestSuite: React.FC<TestSuiteProps> = (props) => {
  const styles = {
    base: css({
      padding: 30,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <ObjectView data={props.data} />
    </div>
  );
};
