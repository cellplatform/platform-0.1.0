import * as t from '../common/types';

type FilesystemId = string;

export type TestFilesystem = {
  id: FilesystemId;
  bus: t.EventBus<any>;
  events: t.SysFsEvents;
  fs: t.Fs;
  ready(): Promise<TestFilesystem>;
  instance(id?: string): t.FsViewInstance;
};
