import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t, COLORS } from '../common';
import { SuiteResults } from './Results.Suite';

export type ResultsProps = {
  data?: t.TestSuiteRunResponse;
  style?: CssValue;
};

export const Results: React.FC<ResultsProps> = (props) => {
  const { data } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ fontSize: 13, color: COLORS.DARK, cursor: 'default' }),
    empty: css({ opacity: 0.4 }),
  };

  const elEmpty = !data && <div {...styles.empty}>No test results to display.</div>;

  return (
    <div {...css(styles.base, props.style)}>
      {data && <SuiteResults data={data} />}
      {elEmpty}
    </div>
  );
};
