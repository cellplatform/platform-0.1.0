import { Typescript } from '.';
import { expect, fs, expectError } from '../../test';

describe.only('Typescript', function () {
  this.timeout(99999);

  describe('compiler', () => {
    it('declarations', async () => {
      const compiler = Typescript.compiler('tsconfig.json');
      const res = await compiler.declarations('tmp/types.d.ts');
      const text = fs.readFileSync(res.outfile).toString();
      expect(text).to.include(`/// <reference types="react" />`);
      expect(res.error).to.eql(undefined);
    });

    it('throw: tsconfig not found', async () => {
      const compiler = Typescript.compiler('foo/bar/tsconfig.json');
      expectError(() => compiler.declarations('tmp/foo.d.ts'), 'tsconfig file not found');
    });
  });
});
