import * as childProcess from 'child_process';
import { IResult } from '../common';

export type ISpawnPromise = Promise<IResult> & {
  child: childProcess.ChildProcess;
  options: childProcess.SpawnOptions;
};

/**
 * Spawns a child process providing both the `child` and completion `promise`.
 */
export function spawn(
  command: string | string[],
  options: childProcess.SpawnOptions = {},
): ISpawnPromise {
  const cmd = Array.isArray(command) ? command.join('\n') : command;
  const env = { ...process.env, FORCE_COLOR: 'true', ...options.env };

  options = {
    stdio: 'inherit',
    shell: true,
    ...options,
    env,
  };

  // Spawn the child process.
  const child = childProcess.spawn(cmd, options);

  // Listen for end.
  const promise = new Promise<IResult>((resolve, reject) => {
    child.on('exit', e => {
      const code = e === null ? 0 : e;
      const ok = code === 0;
      resolve({ ok, code });
    });
    child.once('error', error => {
      resolve({ ok: false, code: 1, error });
    });
  });

  // Finish up.
  const result = promise as ISpawnPromise;
  result.child = child;
  result.options = options;
  return result;
}
