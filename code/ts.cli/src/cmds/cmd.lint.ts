import { exec, fs, getLog, IResult, paths, result } from '../common';

/**
 * Runs the typescript linter.
 */
export async function lint(args: { dir?: string; silent?: boolean } = {}): Promise<IResult> {
  const { silent } = args;
  const dir = args.dir || (await paths.closestParentOf('tslint.json'));
  if (!dir) {
    return result.fail(`A 'tslint.json' file could not be found.`);
  }

  const log = getLog(silent);

  const modules = fs.join(dir, 'node_modules');
  const path = {
    prettier: fs.join(modules, 'prettier/bin-prettier'),
    tslint: fs.join(modules, 'tslint/bin/tslint'),
  };

  try {
    log.info();
    const res = await exec.cmd.runList(
      [
        {
          title: 'prettier',
          cmd: `node ${path.prettier} all --write 'src/**/*.ts{,x}'`,
        },
        {
          title: 'tslint',
          cmd: `node ${path.tslint} 'src/**/*.ts{,x}' --format verbose --fix`,
        },
      ],
      {
        concurrent: true,
        silent,
      },
    );

    log.info();
    return res;
  } catch (error) {
    return result.fail(error);
  }
}
