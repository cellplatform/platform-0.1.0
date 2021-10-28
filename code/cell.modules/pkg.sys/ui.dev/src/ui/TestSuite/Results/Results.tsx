import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, ObjectView } from '../common';
import { SuiteResults } from './Results.Suite';

export type ResultsProps = {
  data?: t.TestSuiteRunResponse;
  style?: CssValue;
};

export const Results: React.FC<ResultsProps> = (props) => {
  const { data } = props;

  const styles = {
    base: css({ fontSize: 14, cursor: 'default' }),
  };

  const elEmpty = !data && <div>Nothing to display.</div>;

  return (
    <div {...css(styles.base, props.style)}>
      {data && <SuiteResults data={data} />}
      {elEmpty}
    </div>
  );
};
