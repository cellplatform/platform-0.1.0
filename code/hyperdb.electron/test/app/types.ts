import { IStoreClient } from '@platform/electron/lib/types';

export type ITestStore = IStoreClient<ITestStoreSettings>;
export type ITestStoreSettings = {
  dbKey?: string;
  dir: string;
  databases: string[];
};
