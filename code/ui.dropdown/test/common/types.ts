import { Subject } from 'rxjs';

export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type ITestState = {
  title?: string;
  count?: number;
};
