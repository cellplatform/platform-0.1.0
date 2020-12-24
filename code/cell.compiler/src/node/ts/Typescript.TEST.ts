import { Typescript } from '.';
import { expect, fs, expectError } from '../../test';

describe('Typescript', function () {
  this.timeout(99999);

  describe('compiler', () => {
    it('throw: tsconfig file not found', async () => {
      const compiler = Typescript.compiler('foo/bar/tsconfig.json');
      expectError(() => compiler.tsconfig.json(), 'tsconfig file not found');
    });

    describe('declarations', () => {
      it('declarations', async () => {
        const compiler = Typescript.compiler('tsconfig.json');
        const res = await compiler.declarations({ outfile: 'tmp/types.d.ts' });
        const text = fs.readFileSync(res.outfile).toString();
        expect(text).to.include(`/// <reference types="react" />`);
        expect(res.error).to.eql(undefined);
      });

      it('declarations: entry', async () => {
        const compiler = Typescript.compiler('tsconfig.json');
        const res = await compiler.declarations({
          outfile: 'tmp/types.d.ts',
          include: 'src/test/sample.node/**/*',
        });
        const text = fs.readFileSync(res.outfile).toString();
        expect(text).to.include(`export type Foo = {`);
        expect(res.error).to.eql(undefined);
      });
    });
  });
});
