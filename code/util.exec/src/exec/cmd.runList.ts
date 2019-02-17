import { resolve } from 'path';

import {
  chalk,
  ICommand,
  ICommandError,
  ICommandErrors,
  ICommandListExecutionResponse,
  IListCommandResult,
  ILog,
  ITask,
} from '../common';
import { tasks } from '../tasks';
import { run } from './cmd.run';

/**
 * Runs a list of commands.
 */
export async function runList(
  commands: string | string[] | ICommand | ICommand[],
  options: tasks.IRunTasksOptions & { dir?: string } = {},
): Promise<ICommandListExecutionResponse> {
  const dir = resolve(options.dir || process.cwd());
  const inputs = Array.isArray(commands) ? commands : [commands];

  // Prepare the commands.
  const cmds: ICommand[] = inputs.map(input =>
    typeof input === 'string' ? { title: input, cmd: input } : input,
  );

  let results: IListCommandResult[] = [];

  // Run the list of commands.
  const list: ITask[] = cmds.map(({ title, cmd }, index) => ({
    title,
    task: async () => {
      const data = await run(cmd, { dir, silent: true });
      const error = data.error;
      const ok = data.error || !data.ok || data.code !== 0 ? false : true;
      results = [...results, { index, ok, cmd, data }];
      if (error) {
        throw new Error(cmd);
      }
    },
  }));
  await tasks.run(list, options);

  // Finish up.
  const errors = formatErrors(results);

  const ok = errors.all.length === 0;
  const code = ok ? 0 : 1;
  const error = ok
    ? undefined
    : new Error(`Error while executing commands (${errors.all.length} of ${cmds.length} failed)`);

  return {
    ok,
    code,
    results,
    error,
    errors: errors.command,
    dir,
  };
}

/**
 * INTERNAL
 */

function formatErrors(results: IListCommandResult[]) {
  const all = results.filter(res => !res.ok);
  const errors: ICommandError[] = [];

  all.forEach(({ index, data, cmd }) => {
    let targetIndex = errors.findIndex(item => item.index === index);

    targetIndex = targetIndex === -1 ? errors.length : targetIndex;
    const target = errors[targetIndex] || { index, cmd, errors: [] };
    errors[targetIndex] = target;
    data.errors.forEach(err => target.errors.push(err));
  });

  const command = errors as ICommandErrors;
  command.log = options => logErrors(command, options);

  return { all, command };
}

function logErrors(errors: ICommandErrors, options: { log?: ILog } = {}) {
  const log = options.log || logger;

  let output = '';
  const add = (...text: string[]) => (output += `${text.join(' ')}\n`);

  errors.forEach(({ index, cmd, errors }) => {
    add(chalk.cyan(`\n(${index + 1})`), chalk.yellow('Errors for command:'));
    add(`    ${chalk.cyan(cmd)}`);
    add();
    errors.forEach(line => {
      const isStackTrace = line.includes(' at ') && line.includes('.js');
      const text = isStackTrace ? chalk.gray(line) : line;
      add(text);
    });
  });

  log.info(output);
}

const logger: ILog = {
  info: console.log, // tslint:disable-line
  warn: console.warn, // tslint:disable-line
  error: console.error, // tslint:disable-line
};
