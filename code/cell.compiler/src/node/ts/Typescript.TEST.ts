import { Typescript } from '.';
import { expect, fs, expectError, SampleBundles } from '../../test';

describe('Typescript', function () {
  this.timeout(99999);

  const config = SampleBundles.simpleNode.config;

  describe('compiler', () => {
    it('throw: tsconfig file not found', async () => {
      const compiler = Typescript.compiler('foo/bar/tsconfig.json');
      expectError(() => compiler.tsconfig.json(), 'tsconfig file not found');
    });
  });
});
