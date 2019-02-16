import * as childProcess from 'child_process';
import { IResult } from '../common';

/**
 * Spawns a child process providing both the `child` and completion `promise`.
 */
export function spawn(command: string | string[], options: childProcess.SpawnOptions = {}) {
  const cmd = Array.isArray(command) ? command.join('\n') : command;

  // Spawn the child process.
  const child = childProcess.spawn(cmd, {
    stdio: 'inherit',
    shell: true,
    ...options,
    env: { FORCE_COLOR: 'true', ...options.env },
  });

  // Listen for end.
  const complete = new Promise<IResult>((resolve, reject) => {
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
  return { child, complete };
}
