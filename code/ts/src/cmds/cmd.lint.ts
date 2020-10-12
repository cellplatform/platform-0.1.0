import { exec, fs, getLog, IResult, paths, result } from '../common';

const CONFIG = `
module.exports = {
  extends: '../../node_modules/@platform/ts.libs/lint',
  rules: {},
};    
`.substring(1);

/**
 * Runs the typescript linter.
 */
export async function lint(args: { dir?: string; silent?: boolean } = {}): Promise<IResult> {
  const { silent } = args;
  const cwd = fs.resolve('.');

  // Rename obsolete configuration file.
  const tslint = 'tslint.json';
  if (await fs.exists(fs.join(cwd, tslint))) {
    fs.rename(fs.join(cwd, tslint), fs.join(cwd, '.tslint.json.OLD'));
  }

  // Ensure there is an ESLint configuration file.
  const eslintrc = '.eslintrc.js';
  let dir = args.dir || (await paths.closestParentOf(eslintrc));
  if (!dir) {
    dir = cwd;
    await fs.writeFile(fs.join(dir, eslintrc), CONFIG);
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
