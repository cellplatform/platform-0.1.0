import { IResult, ITask, Listr } from '../common';

export type IRunTasksOptions = {
  silent?: boolean;
  concurrent?: boolean;
  exitOnError?: boolean;
};

export type IRunTaskListResult = IResult & {
  errors: ITaskError[];
};

export type ITaskError = {
  index: number;
  title: string;
  error: string;
};

/**
 * Runs a set of tasks.
 */
export async function run<T>(
  tasks: ITask<T> | Array<ITask<T>>,
  options: IRunTasksOptions = {},
): Promise<IRunTaskListResult> {
  const { silent, concurrent, exitOnError = false } = options;
  const renderer = silent ? 'silent' : 'default';

  let errors: ITaskError[] = [];
  tasks = Array.isArray(tasks) ? tasks : [tasks];

  const run = async (index: number, title: string, task: ITask['task']) => {
    try {
      return await task();
    } catch (err) {
      const error = err.message as string;
      errors = [...errors, { index, title, error }];
      throw err;
    }
  };

  const runner = new Listr(
    tasks.map(({ title, task }, i) => {
      return {
        title,
        task: () => run(i, title, task),
      };
    }),
    { renderer, concurrent, exitOnError },
  );
  try {
    await runner.run();
  } catch (err) {
    // Ignore - errors caught and returned below.
  }

  // Finish up.
  const ok = errors.length === 0;
  const code = ok ? 0 : 1;
  const error = ok
    ? undefined
    : new Error(`Error while executing tasks (${errors.length} of ${tasks.length} failed)`);
  return { ok, code, error, errors };
}
