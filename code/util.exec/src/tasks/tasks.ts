import { result, IResult, ITask, Listr } from '../common';

export type IRunTasksOptions = {
  silent?: boolean;
  concurrent?: boolean;
  exitOnError?: boolean;
};

/**
 * Runs a set of tasks.
 */
export async function run(
  tasks: ITask | ITask[],
  options: IRunTasksOptions = {},
): Promise<IResult> {
  const { silent, concurrent, exitOnError = false } = options;
  tasks = Array.isArray(tasks) ? tasks : [tasks];

  const run = async (task: ITask['task']) => {
    return task();
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
    return result.success();
  } catch (error) {
    return result.fail(error);
  }
}
