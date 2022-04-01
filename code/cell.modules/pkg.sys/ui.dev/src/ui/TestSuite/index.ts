import { Results, ResultsProps } from './Results';
import { Test as API } from '../../api/TestSuite';

export { ResultsProps };

export const Test = {
  ...API,
  View: { Results },
};
