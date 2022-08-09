import Mocha from 'mocha';
import { fs } from '@platform/fs';

/**
 * Programmatic test runner.
 * https://mochajs.org/api/mocha
 */
export const Test = {
  /**
   * Find test files.
   */
  files(options: { dir?: string; pattern?: string } = {}) {
    const dir = fs.resolve(options.dir ?? fs.path.resolve('src'));
    const pattern = options.pattern ?? '**/*.TEST.ts{,x}';
    return fs.glob.find(fs.path.join(dir, pattern));
  },

  /**
   * Run tests.
   */
  async run(options: { dir?: string; pattern?: string; parallel?: boolean } = {}) {
    const { dir, pattern, parallel } = options;
    const files = await Test.files({ dir, pattern });

    const mocha = new Mocha({ parallel });
    files.forEach((path) => mocha.addFile(path));

    mocha.run((failures: number) => {
      process.exitCode = failures ? 1 : 0;
    });
  },
};
