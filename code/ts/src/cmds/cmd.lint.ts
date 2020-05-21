import { exec, fs, getLog, IResult, paths, result } from '../common';

const CONFIG = `
module.exports = {
  extends: './node_modules/@platform/ts/lint',
};    
`.substring(1);

/**
 * Runs the typescript linter.
 */
export async function lint(args: { dir?: string; silent?: boolean } = {}): Promise<IResult> {
  const { silent } = args;

  const filename = '.eslintrc.js';
  let dir = args.dir || (await paths.closestParentOf(filename));
  if (!dir) {
    dir = fs.resolve('.');
    await fs.writeFile(fs.join(dir, filename), CONFIG);
  }

  const log = getLog(silent);

  const modules = fs.join(dir, 'node_modules');
  const path = {
    prettier: fs.join(modules, 'prettier/bin-prettier'),
    lint: fs.join(modules, 'eslint/bin/eslint'),
  };

  try {
    log.info();
    const res = await exec.cmd.runList(
      [
        {
          title: 'prettier',
          cmd: `node ${path.prettier} --write 'src/**/*.ts{,x}'`,
        },
        {
          title: 'lint',
          cmd: `node ${path.lint} 'src/**/*.ts{,x}' --fix`,
        },
      ],
      {
        concurrent: true,
        silent,
      },
    );

    // Finish up.
    res.errors.log({ log });
    return res;
  } catch (error) {
    return result.fail(error);
  }
}
