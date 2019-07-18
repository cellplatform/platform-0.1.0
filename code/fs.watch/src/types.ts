import { Observable } from 'rxjs';

export type FsWatchAction = 'add' | 'change' | 'remove';

export type FsWatchEvent = {
  type: FsWatchAction;
  path: string;
  isDir: boolean;
  isFile: boolean;
};

export type FsWatcher = {
  pattern: string;
  actions: FsWatchAction[];
  events$: Observable<FsWatchEvent>;
  isDisposed: boolean;
  dispose(): void;
};
