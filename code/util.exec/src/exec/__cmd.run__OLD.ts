import { spawn } from 'child_process';
import { Subject } from 'rxjs';

import { ICommandInfo, IResult, result as resultUtil } from '../common';

/**
 * Invokes a shell command.
 */
export function __run__OLD(
  cmd: string,
  options: {
    dir?: string;
    silent?: boolean;
    info$?: Subject<ICommandInfo>;
  } = {},
) {
  return new Promise<IResult>(async (resolve, reject) => {
    const { dir: cwd, silent, info$ } = options;
    let info: string[] = [];
    let errors: string[] = [];

    // Spwan the shell process.
    const stdio = silent ? undefined : 'inherit';
    const child = spawn(cmd, {
      cwd,
      shell: true,
      stdio,
      env: { FORCE_COLOR: 'true' },
    });

    const fire = (type: ICommandInfo['type'], lines: string[]) => {
      if (info$) {
        lines.forEach(text => info$.next({ type, text }));
      }
    };

    const add = (type: ICommandInfo['type'], list: string[], chunk: Buffer) => {
      const lines = formatOutput(chunk);
      list = [...list, ...lines];
      fire(type, lines);
      return list;
    };

    // Monitor data coming from process.
    if (child.stdout) {
      child.stdout.on('data', (chunk: Buffer) => {
        info = add('stdout', info, chunk);
      });
      child.stderr.on('data', (chunk: Buffer) => {
        errors = add('stderr', errors, chunk);
      });
    }

    // Listen for end.
    child.on('exit', e => {
      const result = resultUtil.format({ code: e || 0, info, errors });
      resolve(result);
    });
    child.once('error', err => reject(err));
  });
}

/**
 * INTERNAL
 */
const formatOutput = (chunk: Buffer) => {
  return chunk
    .toString()
    .replace(/\n$/, '')
    .split('\n');
};
