import { Observable } from 'rxjs';

export type FsWatchAction = 'add' | 'change' | 'remove';

export type FsWatchEvent = {
  type: FsWatchAction;
  path: string;
  name: string;
  isDir: boolean;
  isFile: boolean;
};

export type FsWatcher = {
  pattern: string;
  actions: FsWatchAction[];
  events$: Observable<FsWatchEvent>;
  isReady: boolean;
  isDisposed: boolean;
  dispose(): void;
};
