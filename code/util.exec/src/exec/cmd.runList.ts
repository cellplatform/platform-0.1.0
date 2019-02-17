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
      const res = run(cmd, { dir, silent: true });
      const data = await res;
      const error = data.error;
      const ok = data.error || !data.ok || data.code !== 0 ? false : true;
      const { stdout, stderr } = res;
      results = [...results, { index, ok, cmd, data, stdout, stderr }];
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

  all.forEach(({ index, data, cmd, stdout, stderr }) => {
    let targetIndex = errors.findIndex(item => item.index === index);
    targetIndex = targetIndex === -1 ? errors.length : targetIndex;

    const target = errors[targetIndex] || { index, cmd, errors: [] };
    errors[targetIndex] = target;

    data.errors.forEach(err => target.errors.push(err));
    stdout.forEach(line => target.errors.push(line));
    stderr.forEach(line => target.errors.push(line));
  });

  const command = errors as ICommandErrors;
  command.log = options => logErrors(command, options);

  return { all, command };
}

function logErrors(
  errors: ICommandErrors,
  options: { log?: ILog | null; index?: number | number[]; header?: boolean } = {},
) {
  const log = options.log === null ? undefined : options.log || logger;
  const indexes =
    options.index === undefined
      ? undefined
      : Array.isArray(options.index)
      ? options.index
      : [options.index];

  let output = '';
  const add = (...text: any[]) => (output += `${text.join(' ')}\n`);

  errors.forEach(({ index, cmd, errors }) => {
    if (indexes && !indexes.includes(index)) {
      return;
    }
    if (options.header) {
      add('\n', chalk.yellow('Errors for command:'));
      add(`    ${chalk.gray(cmd)}`);
      add();
    }
    errors.forEach(line => {
      const isStackTrace = line.includes(' at ') && line.includes('.js');
      const text = isStackTrace ? chalk.gray(line) : line;
      add(text);
    });
  });

  if (log) {
    log.info(output);
  }
  return output;
}

const logger: ILog = {
  info: console.log, // tslint:disable-line
  warn: console.warn, // tslint:disable-line
  error: console.error, // tslint:disable-line
};
