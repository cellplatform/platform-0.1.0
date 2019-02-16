import { result, IResult, ITask, Listr } from '../common';

export type IRunTasksOptions = {
  silent?: boolean;
  concurrent?: boolean;
  exitOnError?: boolean;
};

/**
 * Runs a set of tasks.
 */
export async function run(list: ITask | ITask[], options: IRunTasksOptions = {}): Promise<IResult> {
  const { silent, concurrent, exitOnError = false } = options;
  list = Array.isArray(list) ? list : [list];

  const run = async (task: ITask['task']) => {
    return task();
  };

  const runner = new Listr(
    list.map(({ title, task }) => {
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
    return result.success();
  } catch (error) {
    return result.fail(error);
  }
}
