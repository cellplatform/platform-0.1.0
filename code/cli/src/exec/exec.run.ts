import { spawn } from 'child_process';
import { IResult, result as resultUtil } from '../common';

/**
 * Invokes a shell command.
 */
export function run(
  cmd: string,
  options: { dir?: string; silent?: boolean } = {},
) {
  return new Promise<IResult>(async (resolve, reject) => {
    const { dir: cwd, silent } = options;
    let info: string[] = [];
    let errors: string[] = [];

    // Spwan the shell process.
    const stdio = silent ? undefined : 'inherit';
    const child = spawn(cmd, { cwd, shell: true, stdio });

    // Monitor data coming from process.
    if (child.stdout) {
      //   if (!silent) {
      //     child.stdout.pipe(process.stdout);
      //   }
      child.stdout.on('data', (chunk: Buffer) => {
        info = [...info, ...formatOutput(chunk)];
      });
      child.stderr.on('data', (chunk: Buffer) => {
        errors = [...errors, ...formatOutput(chunk)];
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
function formatOutput(chunk: Buffer) {
  return chunk
    .toString()
    .replace(/\n$/, '')
    .split('\n');
}
