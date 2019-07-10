export * from '@platform/cli.ui/lib/types';
export * from '@platform/electron/lib/types';
export * from '@platform/fs.db/lib/types';
export * from '../src/types';

import * as t from '../src/types';
import { IDb } from '@platform/fs.db/lib/types';

export type ICommandProps = {
  db: t.DbFactory;
  state: ITestState;
  current: IDb;
  next(state: Partial<ITestState>): void;
};

export type ITestState = {
  current?: string;
  databases?: {};
};
