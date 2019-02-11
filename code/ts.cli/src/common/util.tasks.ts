import { IResult, ITask, ICommand } from '../types';
import { Listr, exec } from './libs';

export type IRunTasksOptions = {
  silent?: boolean;
  concurrent?: boolean;
  exitOnError?: boolean;
};

/**
 * Runs a set of tasks.
 */
export async function runTasks(
  tasks: ITask | ITask[],
  options: IRunTasksOptions = {},
): Promise<IResult> {
  const { silent, concurrent, exitOnError = false } = options;
  tasks = Array.isArray(tasks) ? tasks : [tasks];

  const run = async (task: ITask['task']) => {
    const res = await task();
    if (res.error) {
      throw res.error;
    }
    return res;
  };

  const runner = new Listr(
    tasks.map(({ title, task }) => {
      return {
        title,
        task: async () => run(task),
      };
    }),
    {
      renderer: silent ? 'silent' : 'default',
      concurrent,
      exitOnError,
    },
  );
  try {
    await runner.run();
    return { code: 0 };
  } catch (error) {
    return { code: 1, error };
  }
}

/**
 * Runs a list of commands.
 */
export async function runCommands(
  cmds: string | string[] | ICommand | ICommand[],
  options: IRunTasksOptions & { dir?: string } = {},
) {
  const { dir } = options;
  const inputs = Array.isArray(cmds) ? cmds : [cmds];

  const commands: ICommand[] = inputs.map(input =>
    typeof input === 'string' ? { title: input, cmd: input } : input,
  );

  const tasks: ITask[] = commands.map(({ title, cmd }) => ({
    title,
    task: async () => {
      const res = await exec.run(cmd, { dir, silent: true });
      const code = res.code;
      return code === 0 ? { code } : fail(`Failed executing '${cmd}'`);
    },
  }));

  return runTasks(tasks, options);
}

/**
 * Prepares a failure response.
 */
export function fail(err: string | Error, code?: number): IResult {
  const message = typeof err === 'string' ? err : err.message;
  code = code === undefined ? 1 : code;
  const error = new Error(message);
  return { code, error };
}
