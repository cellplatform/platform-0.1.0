import * as t from '../common/types';

export type TestFilesystem = {
  bus: t.EventBus<any>;
  instance: t.FsViewInstance;
  events: t.SysFsEvents;
  fs: t.Fs;
  ready: () => Promise<TestFilesystem>;
};
