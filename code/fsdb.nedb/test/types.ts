import { Subject } from 'rxjs';
// import { Nedb } from '../src/Nedb';
import { Store } from '../src/store';
import { NeDb } from '../src';

export * from '@platform/cli.ui/lib/types';
export * from '@platform/fsdb.types';
export * from '../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  db: Store;
  doc: NeDb;
};

export type ITestState = {
  docs?: any;
};
