import { TestSuiteResults, TestSuiteResultsProps } from './TestSuiteResults';
import { Test as API } from '../../api/TestSuite';

export { TestSuiteResultsProps };

export const Test = {
  ...API,
  View: {
    Results: TestSuiteResults,
  },
};
