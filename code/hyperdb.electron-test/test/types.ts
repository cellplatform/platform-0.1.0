import {
  IStoreClient,
  IRendererContext as IBaseContext,
  IpcClient,
} from '@platform/electron/lib/types';
import { IDbRenderer, IDbRendererFactory } from '@platform/hyperdb.electron/lib/types';
import { ICommandLine } from './renderer/cli/types';

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
  cli: ICommandLine;
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
