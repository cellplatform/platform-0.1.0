import {
  IpcClient,
  IRendererContext as IBaseContext,
  IStoreClient,
} from '@platform/electron/lib/types';
import { IDbRenderer, IDbRendererFactory } from '@platform/hyperdb.electron/lib/types';

import { ITestCommandLine } from './renderer/cli/types';

export * from '@platform/cli.spec/lib/types';
export * from '@platform/hyperdb.electron/lib/types';
export * from './renderer/cli/types';

/**
 * [Store]
 */
export type ITestStore = IStoreClient<ITestStoreSettings>;
export type ITestStoreSettings = {
  dbKey?: string;
  dir: string;
  databases: string[];
};

/**
 * [Context]
 */
export type ITestRendererContext = IBaseContext<TestEvents, ITestStoreSettings> & {
  cli: ITestCommandLine;
  db: IDbRendererFactory;
};

/**
 * [Database]
 */
export type ITestDbData = {
  ['.sys/dbname']: string;
  ['.sys/watch']: string[];
};
export type ITestRendererDb = IDbRenderer<ITestDbData>;

/**
 * [Ipc-Events]
 */
export type TestIpcClient = IpcClient<TestEvents>;

export type TestEvents = ITestEvent;
export type ITestEvent = {
  type: 'TEST/foo';
  payload: {};
};
