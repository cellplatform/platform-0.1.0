import { ICommand, ITask, result } from '../common';
import { tasks } from '../tasks';
import { run as exec } from './exec.run';

/**
 * Runs a list of commands.
 */
export async function runCommands(
  cmds: string | string[] | ICommand | ICommand[],
  options: tasks.IRunTasksOptions & { dir?: string } = {},
) {
  const { dir } = options;
  const inputs = Array.isArray(cmds) ? cmds : [cmds];

  const commands: ICommand[] = inputs.map(input =>
    typeof input === 'string' ? { title: input, cmd: input } : input,
  );

  const list: ITask[] = commands.map(({ title, cmd }) => ({
    title,
    task: async () => {
      const res = await exec(cmd, { dir, silent: true });
      const code = res.code;
      return code === 0
        ? result.success()
        : result.fail(`Failed executing '${cmd}'`);
    },
  }));

  return tasks.run(list, options);
}
