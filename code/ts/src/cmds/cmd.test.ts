import { exec, fs, getLog, IResult, paths, result } from '../common';

/**
 * Runs tests.
 */
export async function test(
  args: { dir?: string; silent?: boolean; watch?: boolean; suffix?: string } = {},
): Promise<IResult> {
  const { silent, watch } = args;
  const log = getLog(silent);

  const dir = args.dir || (await paths.closestParentOf('package.json'));
  if (!dir) {
    return result.fail(`A module root with [package.json] could not be found.`);
  }

  let flags = '';
  flags += `--require ts-node/register \\`;
  if (watch) {
    flags += `--reporter min \\`;
    flags += `--watch-extensions ts,tsx \\`;
    flags += `--watch \\`;
  }

  let { suffix = 'TEST,test' } = args;
  suffix = suffix.includes(',') ? `{${suffix}}` : suffix;
  const pattern = `src/**/*.${suffix}.ts{,x}`;
  if (!watch) {
    log.info(pattern);
  }

  const cmd = `
    export NODE_ENV=test
    export TS_NODE_TRANSPILE_ONLY=true
    export TS_NODE_FAST=true
    export TS_NODE_COMPILER_OPTIONS='{ "module": "commonjs" }'
    
    mocha \\
      ${flags}
      '${pattern}' \\
  `;

  const done = (res: IResult) => {
    return res.code === 0 ? res : result.fail(`Tests failed.`, res.code);
  };

  try {
    // Run with interactive console.
    const res = await exec.cmd.run(cmd, { silent, cwd: fs.resolve(dir) });

    if (!res.ok && res.errors.some((line: any) => line.includes('Error: No test files found'))) {
      log.info(`No tests found.\n`);
      return done({ ok: true, code: 0 }); // No tests, don't fail the operation, just print a warning.
    }

    if (!res.ok && res.errors.length > 0) {
      res.errors.forEach((line) => log.info(line));
      log.info();
    }

    return done(res);
  } catch (error: any) {
    return result.fail(error);
  }
}
