import { Subject } from 'rxjs';
import { NedbStore } from '../src/store';
import { NeDb } from '../src';

export * from '@platform/fsdb.types';
export * from '../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  store: NedbStore;
  db: NeDb;
};

export type ITestState = {
  docs?: any;
};
