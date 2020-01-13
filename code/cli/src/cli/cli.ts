import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { log, t, yargs } from '../common';
import { tasks } from '../tasks';

export { tasks };
export { fs, exec, inquirer, yargs, log, Listr, prompt } from '../common';
export * from '../types';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', err => {
  throw err;
});

/**
 * Starts a task list.
 */
export function task(title: string, task: t.Task) {
  return tasks().task(title, task);
}

/**
 * Initializes a new command line.
 *
 *    Cheat sheet.
 *    https://devhints.io/yargs
 *
 */
export function create(name: string) {
  const SCRIPT = log.magenta(name);
  const COMMAND = log.cyan('<command>');
  const OPTIONS = log.gray('[options]');

  const events$ = new Subject<t.CmdAppEvent>();
  const fire = (e: t.CmdAppEvent) => events$.next(e);

  const showHelp = (argv: t.ICmdArgv) => {
    fire({ type: 'CLI/showHelp', payload: { stage: 'BEFORE', argv } });
    program.showHelp();
    fire({ type: 'CLI/showHelp', payload: { stage: 'AFTER', argv } });
  };

  const exit = (code: number) => {
    const ok = code === 0;
    fire({ type: 'CLI/exit', payload: { ok, code } });
    log.info();
    process.exit(code);
  };

  const program = yargs
    // Setup command header.
    .scriptName('')
    .usage(`${'Usage:'} ${SCRIPT} ${COMMAND} ${OPTIONS}`);

  const { command, option } = program;

  const api: t.ICmdApp = {
    program,
    command,
    option,
    exit,
    events$: events$.pipe(share()),
    task(title: string, task: t.Task) {
      return tasks().task(title, task);
    },
    skip(title: string, task: t.Task) {
      return tasks().skip(title, task);
    },
    run() {
      const argv = program.argv;
      if (!argv._[0]) {
        showHelp(argv);
        exit(0);
      }
    },
  };

  return api;
}
