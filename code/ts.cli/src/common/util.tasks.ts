import { IResult, ITask } from '../types';
import { Listr } from './libs';

/**
 * Runs a set of tasks.
 */
export async function runTasks(
  tasks: ITask | ITask[],
  options: { silent?: boolean; concurrent?: boolean } = {},
): Promise<IResult> {
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
      renderer: options.silent ? 'silent' : 'default',
      concurrent: options.concurrent,
    },
  );
  try {
    await runner.run();
    return { code: 0 };
  } catch (error) {
    return { code: 1, error };
  }
}
