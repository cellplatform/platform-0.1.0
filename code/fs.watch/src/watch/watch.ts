import { basename } from 'path';
import { Subject } from 'rxjs';
import { distinctUntilChanged, share, takeUntil } from 'rxjs/operators';

import { chokidar, t } from '../common';

export * from '../types';

export const IGNORE = {
  DOT_FILES: /(^|[/\\])\../,
};

/**
 * Starts a file-system watcher.
 */
export function start(args: {
  pattern: string;
  actions?: t.FsWatchAction[];
  ignore?: RegExp;
}): t.FsWatcher {
  const dispose$ = new Subject<void>();
  const { pattern } = args;
  const actions: t.FsWatchAction[] =
    args.actions === undefined ? ['add', 'change', 'remove'] : args.actions;

  const events$ = new Subject<t.FsWatchEvent>();
  const watcher = chokidar.watch(pattern, {
    ignored: args.ignore,
    persistent: true,
  });

  // Monitor ready state.
  let isReady = false;
  watcher.on('ready', () => {
    isReady = true;
  });

  const next = (type: t.FsWatchAction, path: string, isDir: boolean) => {
    const name = basename(path);
    events$.next({ type, path, name, isDir, isFile: !isDir });
  };

  // Connect to events.
  if (actions.includes('add')) {
    watcher.on('add', (path, stats) => next('add', path, false));
    watcher.on('addDir', (path, stats) => next('add', path, true));
  }
  if (actions.includes('change')) {
    watcher.on('change', (path, stats) => next('change', path, false));
  }
  if (actions.includes('remove')) {
    watcher.on('unlink', (path) => next('remove', path, false));
    watcher.on('unlinkDir', (path) => next('remove', path, true));
  }

  // API.
  const res: t.FsWatcher = {
    pattern,
    actions,
    events$: events$.pipe(
      takeUntil(dispose$),
      distinctUntilChanged((prev, next) => prev.type === next.type && prev.path === next.path),
      share(),
    ),
    get isReady() {
      return isReady && !res.isDisposed;
    },
    get isDisposed() {
      return dispose$.isStopped;
    },
    dispose() {
      watcher.close();
      dispose$.next();
      dispose$.complete();
    },
  };
  return res;
}
