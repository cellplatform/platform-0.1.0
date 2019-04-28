import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { fs, NodeProcess } from './libs';

/**
 * Monitors events of a child node-process creating a list of
 * actions that occured.
 */
export function monitorProcessEvents(process: NodeProcess) {
  const done$ = new Subject();
  const process$ = process.events$.pipe(takeUntil(done$));

  let actions: string[] = [];
  process$
    .pipe(filter(e => e.type === 'PROCESS/stopped'))
    .subscribe(e => (actions = [...actions, 'STOPPED']));
  process$
    .pipe(filter(e => e.type === 'PROCESS/started'))
    .subscribe(e => (actions = [...actions, 'STARTED']));

  return {
    stop: () => done$.next(),
    get actions() {
      return actions;
    },
  };
}

/**
 * Retrieves the [NodeProcess] for the given dir.
 */
export function getProcess(cwd: string, NPM_TOKEN?: string) {
  cwd = fs.resolve(cwd);
  return NodeProcess.singleton({ cwd, NPM_TOKEN });
}
