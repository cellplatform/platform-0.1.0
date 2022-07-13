import * as t from '../common/types';

type Milliseconds = number;
type FilesystemId = string;

/**
 * Helper function for assembling and starting a filesystem (controller/events).
 */
export type FilesystemCreate = (options?: FilesystemCreateOptions) => FilesystemCreateResponse;
export type FilesystemCreateOptions = {
  bus?: t.EventBus<any>;
  fs?: FilesystemId;
  timeout?: Milliseconds;
  dispose$?: t.Observable<any>;
};

export type FilesystemCreateResponse = {
  id: FilesystemId;
  bus: t.EventBus<any>;
  fs: t.Fs;
  events: t.SysFsEvents;
  dispose$?: t.Observable<any>;
  dispose(): void;
  ready(): Promise<FilesystemCreateResponse & { store: t.SysFsController }>;
};
