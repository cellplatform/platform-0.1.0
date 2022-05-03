import React from 'react';

import { CssValue, Test, TestSuiteRunResponse } from '../common';

export type TestResultsViewProps = {
  results?: TestSuiteRunResponse;
  style?: CssValue;
};

export const TestResultsView: React.FC<TestResultsViewProps> = (props) => {
  return <Test.View.Results padding={20} scroll={true} data={props.results} style={props.style} />;
};
