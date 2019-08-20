import { log, yargs, t } from '../common';
import { tasks } from '../tasks';

export { fs, exec, inquirer, yargs, log, Listr } from '../common';
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

  const program = yargs
    // Setup command header.
    .scriptName('')
    .usage(`${'Usage:'} ${SCRIPT} ${COMMAND} ${OPTIONS}`);

  const { command, option } = program;

  const api: t.ICli = {
    program,
    command,
    option,
    exit,
    task(title: string, task: t.Task) {
      return tasks().task(title, task);
    },
    skip(title: string, task: t.Task) {
      return tasks().skip(title, task);
    },
    run() {
      const argv = program.argv;
      if (!argv._[0]) {
        program.showHelp();
        exit(0);
      }
    },
  };

  return api;
}

/**
 * Exits with the given code.
 */
export function exit(code: number) {
  log.info();
  process.exit(code);
}
