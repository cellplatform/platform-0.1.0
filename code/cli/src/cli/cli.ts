import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { log, t, yargs, prompt } from '../common';
import { tasks } from '../tasks';
import { initKeyboard } from './cli.keyboard';
import { init as initPlugins } from './cli.plugins';

export { tasks };
export { fs, exec, inquirer, yargs, log, Listr, prompt } from '../common';
export * from '../types';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', (err) => {
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

  const _events$ = new Subject<t.CmdAppEvent>();
  const events$ = _events$.pipe(share());
  const fire: t.FireEvent = (e) => _events$.next(e);

  const showHelp = (argv: t.ICmdArgv) => {
    const payload = { argv };
    fire({ type: 'CLI/showHelp/before', payload });
    program.showHelp();
    fire({ type: 'CLI/showHelp/after', payload });
  };

  const exit: t.CmdAppExit = (code) => {
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
  let plugins: undefined | t.ICmdPlugins;
  let keyboard: undefined | t.ICmdKeyboard;

  const cli: t.ICmdApp = {
    program,
    command,
    option,
    exit,
    events$,
    prompt,
    get plugins() {
      return plugins || (plugins = initPlugins({ cli, events$, exit }));
    },
    get keyboard() {
      return keyboard || (keyboard = initKeyboard({ fire, events$, exit }));
    },
    task(title: string, task: t.Task) {
      return tasks().task(title, task);
    },
    skip(title: string, task: t.Task) {
      return tasks().skip(title, task);
    },
    run() {
      const argv = program.argv as { _: string[] };
      if (!argv._?.[0]) {
        showHelp(argv);
        exit(0);
      }
    },
  };

  return cli;
}
