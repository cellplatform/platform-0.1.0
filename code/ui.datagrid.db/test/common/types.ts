import { Subject } from 'rxjs';
import * as t from '../../src/common/types';
import { DbFactory } from '@platform/fsdb.electron/lib/types';
import { IRendererContext } from '@platform/electron/lib/types';

export * from '@platform/cli.ui/lib/types';
export * from '@platform/fsdb.types';
export * from '@platform/fsdb.electron/lib/types';
export * from '@platform/electron/lib/types';

export * from '../../src/common/types';
import { Sync } from '../../src';

export type ICommandProps = {
  state$: Subject<ITestState>;
  databases: DbFactory;
  db: t.IDb;
  sync: Sync;
};

export type ITestState = {
  showDebug?: boolean;
};

export type ILocalContext = IRendererContext & {
  databases: DbFactory;
};
