import * as Mocha from 'mocha';
import { fs } from '@platform/fs';

/**
 * Run Mocha tests.
 * https://mochajs.org/api/mocha
 */
export async function run(dir?: string, options: { pattern?: string; parallel?: boolean } = {}) {
  // Find test files.
  const base = fs.resolve(dir || fs.path.resolve('src'));
  const pattern = options.pattern || '**/*.TEST.ts{,x}';
  const files = await fs.glob.find(fs.path.join(base, pattern));

  // Stand up test suite.
  const { parallel } = options;
  const mocha = new Mocha({ parallel });
  files.forEach((path) => mocha.addFile(path));

  // Start the runner.
  mocha.run((failures: number) => {
    process.exitCode = failures ? 1 : 0;
  });
}

run();
