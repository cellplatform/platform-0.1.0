import { spawn } from 'child_process';

export type IExecResult = {
  code: number;
  info: string[];
  errors: string[];
};

/**
 * Invokes a shell command.
 */
export function run(
  cmd: string,
  options: { dir?: string; silent?: boolean } = {},
) {
  return new Promise<IExecResult>(async (resolve, reject) => {
    const { dir: cwd, silent } = options;

    // Spwan the shell process.
    let result: IExecResult = { code: 0, info: [], errors: [] };
    const child = spawn(cmd, { cwd, shell: true });

    // Monitor data coming from process.
    if (!silent) {
      child.stdout.pipe(process.stdout);
    }
    child.stdout.on('data', (chunk: Buffer) => {
      const msg = chunk.toString().replace(/\n$/, '');
      result.info = [...result.info, msg];
    });
    child.stderr.on('data', (chunk: Buffer) => {
      const msg = chunk.toString().replace(/\n$/, '');
      result.errors = [...result.errors, msg];
    });

    // Listen for end.
    child.on('exit', e => {
      const code = e !== null ? e : result.errors.length === 0 ? 0 : 1;
      result = { ...result, code };
      resolve(result);
    });
    child.on('error', err => reject(err));
  });
}
