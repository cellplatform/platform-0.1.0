import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t } from '../common';
import { TestResult } from './Results.Test';

export type SuiteResultsProps = {
  data: t.TestSuiteRunResponse;
  style?: CssValue;
};

export const SuiteResults: React.FC<SuiteResultsProps> = (props) => {
  const { data } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    title: {
      base: css({ Flex: 'horizontal-stretch-stretch', marginBottom: 4 }),
      description: css({ flex: 1 }),
      elapsed: css({ opacity: 0.4, userSelect: 'none' }),
    },
    body: css({
      position: 'relative',
      paddingLeft: 10,
    }),
  };

  const elTests = data.tests.map((test, i) => <TestResult key={i} data={test} />);
  const elChildren = data.children.map((suite, i) => <SuiteResults key={i} data={suite} />);

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.title.base}>
        <div {...styles.title.description}>{data.description}</div>
        <div {...styles.title.elapsed}>{data.elapsed}ms</div>
      </div>
      <div {...styles.body}>
        {elTests}
        {elChildren}
      </div>
    </div>
  );
};
