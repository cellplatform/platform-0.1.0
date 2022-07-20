import { Subject } from 'rxjs';
import * as t from '../../src/types';

export * from '../../src/types';

export type ICommandProps = {
  client: t.IGqlClient;
  state$: Subject<ITestState>;
  next(state: ITestState): void;
};

export type ITestState = {
  res?: any;
};
