import { Results, ResultsProps } from './Results';
import { Test as API } from '../../api/TestSuite';

export { ResultsProps as TestSuiteResultsProps };

export const Test = {
  ...API,
  View: {
    Results: Results,
  },
};
