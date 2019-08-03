import { Subject } from 'rxjs';
import { Nedb } from '../src/Nedb';
import { NeDoc } from '../src';

export * from '@platform/cli.ui/lib/types';
export * from '@platform/fsdb.types';
export * from '../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  db: Nedb;
  doc: NeDoc;
};

export type ITestState = {
  docs?: any;
};
