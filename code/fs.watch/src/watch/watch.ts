import { Subject } from 'rxjs';
import { share, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { chokidar, t } from '../common';

export * from '../types';

export const IGNORE = {
  DOT_FILES: /(^|[\/\\])\../,
};

/**
 * Starts a file-system watcher.
 */
export function start(args: {
  pattern: string;
  actions?: t.FsWatchAction[];
  ignore?: RegExp;
}): t.FsWatcher {
  const dispose$ = new Subject();
  const { pattern } = args;
  const actions: t.FsWatchAction[] =
    args.actions === undefined ? ['add', 'change', 'remove'] : args.actions;

  const events$ = new Subject<t.FsWatchEvent>();
  const watcher = chokidar.watch(pattern, {
    ignored: args.ignore,
    persistent: true,
  });

  const next = (type: t.FsWatchAction, path: string, isDir: boolean) => {
    events$.next({ type, path, isDir, isFile: !isDir });
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
    watcher.on('unlink', path => next('remove', path, false));
    watcher.on('unlinkDir', path => next('remove', path, true));
  }

  return {
    pattern,
    actions,
    events$: events$.pipe(
      takeUntil(dispose$),
      distinctUntilChanged((prev, next) => prev.type === next.type && prev.path === next.path),
      share(),
    ),
    get isDisposed() {
      return dispose$.isStopped;
    },
    dispose() {
      watcher.close();
      dispose$.next();
    },
  };
}
