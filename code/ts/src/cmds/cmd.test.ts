import { exec, paths, join } from '../common';

export type ITestResult = {
  success: boolean;
  error?: Error;
};

/**
 * Runs tests.
 */
export async function test(
  args: { silent?: boolean; watch?: boolean } = {},
): Promise<ITestResult> {
  const { silent, watch } = args;
  const dir = paths.closestParentOf('package.json');
  if (!dir) {
    const error = new Error(
      `A module root with [package.json] could not be found.`,
    );
    return { success: false, error };
  }

  const modules = join(dir, 'node_modules');
  const mocha = join(modules, 'mocha/bin/mocha');

  let flags = '';
  flags += `--require ts-node/register \\`;
  if (watch) {
    flags += `--reporter min \\`;
    flags += `--watch-extensions ts,tsx \\`;
    flags += `--watch \\`;
  }

  const cmd = `
    export NODE_ENV=test
    export TS_NODE_TRANSPILE_ONLY=true
    export TS_NODE_FAST=true
    
    ${mocha} \\
      ${flags}
      'src/**/*.{test,TEST}.ts{,x}' \\
  `;

  try {
    let error: Error | undefined;
    const res = await exec.run(cmd, { silent, dir });
    if (res.code !== 0) {
      error = new Error(`Tests failed.`);
    }
    return { success: !error, error };
  } catch (error) {
    return { success: false, error };
  }
}
