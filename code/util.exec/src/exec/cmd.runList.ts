import { ICommand, IResult, IResultInfo, ITask } from '../common';
import { tasks } from '../tasks';
import { run } from './cmd.run';

export type IRunCommandListResult = IResult & {
  ok: boolean;
  results: IRunCommandResult[];
};

export type IRunCommandResult = {
  ok: boolean;
  index: number;
  cmd: string;
  data: IResultInfo;
  error?: Error;
};

/**
 * Runs a list of commands.
 */
export async function runList(
  commands: string | string[] | ICommand | ICommand[],
  options: tasks.IRunTasksOptions & { dir?: string } = {},
): Promise<IRunCommandListResult> {
  const { dir } = options;
  const inputs = Array.isArray(commands) ? commands : [commands];
  const cmds: ICommand[] = inputs.map(input =>
    typeof input === 'string' ? { title: input, cmd: input } : input,
  );

  let results: IRunCommandResult[] = [];

  // Run the list of commands.
  const list: ITask[] = cmds.map(({ title, cmd }, index) => ({
    title,
    task: async () => {
      const data = await run(cmd, { dir, silent: true });
      const error = data.error;
      const ok = data.error || !data.ok || data.code !== 0 ? false : true;
      results = [...results, { index, ok, cmd, data, error }];
      if (error) {
        throw error;
      }
    },
  }));
  await tasks.run(list, options);

  // Finish up.

  const errors = results.filter(res => !res.ok);
  const ok = errors.length === 0;
  const code = ok ? 0 : 1;
  const error = ok
    ? undefined
    : new Error(`Error while executing commands (${errors.length} of ${cmds.length} failed)`);

  return { ok, code, results, error };
}
