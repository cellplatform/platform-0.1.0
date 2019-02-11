import { spawn } from 'child_process';
import { IResult, result } from '../common';

/**
 * Invokes a shell command.
 */
export function run(
  cmd: string,
  options: { dir?: string; silent?: boolean } = {},
) {
  return new Promise<IResult>(async (resolve, reject) => {
    const { dir: cwd, silent } = options;

    // Spwan the shell process.
    const stdio = silent ? undefined : 'inherit';
    const child = spawn(cmd, { cwd, shell: true, stdio });

    // Monitor data coming from process.
    // if (child.stdout) {
    //   if (!silent) {
    //     child.stdout.pipe(process.stdout);
    //   }
    //   child.stdout.on('data', (chunk: Buffer) => {
    //     const msg = chunk.toString().replace(/\n$/, '');
    //     result.info = [...result.info, msg];
    //   });
    //   child.stderr.on('data', (chunk: Buffer) => {
    //     const msg = chunk.toString().replace(/\n$/, '');
    //     result.errors = [...result.errors, msg];
    //   });
    // }

    // Listen for end.
    child.on('exit', e => {
      // const code = e !== null ? e : result.errors.length === 0 ? 0 : 1;
      const code = e || 0;
      // const result = {  code: e || 0 };
      resolve(result.format({ code }));
    });
    child.once('error', err => reject(err));
  });
}
