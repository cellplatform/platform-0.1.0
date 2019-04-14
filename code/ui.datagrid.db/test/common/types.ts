import { Subject } from 'rxjs';
import * as t from '../../src/types';

export * from '@platform/ui.cli/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  databases: t.IDbFactory;
  db: IDb;
};

export type ITestState = {
  values?: t.IGridValues;
  showDebug?: boolean;
  'db.cells'?: {};
};

export type IDb = t.IDb<IDbSchema>;
export type IDbSchema = {
  foo: number;
};
