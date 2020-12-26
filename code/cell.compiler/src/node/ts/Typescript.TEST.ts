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
        const res = await compiler.declarations({ outfile: 'tmp/types' });
        expect(res.outfile.endsWith('.d.ts')).to.eql(true); // NB: implicitly assigned extension (".d.txt")

        const text = fs.readFileSync(res.outfile).toString();
        expect(text).to.include(`/// <reference types="react" />`);
        expect(res.error).to.eql(undefined);
      });

      it('declarations: explicit "include" and ".d.ts" extension', async () => {
        const compiler = Typescript.compiler('tsconfig.json');
        const res = await compiler.declarations({
          outfile: 'tmp/types.d.ts',
          // include: 'src/test/sample.node/**/*',
          include: 'src/test/sample.node/entry.ts',
        });

        expect(res.outfile.endsWith('.d.ts')).to.eql(true);

        const text = fs.readFileSync(res.outfile).toString();
        expect(text).to.include(`export type Foo = {`);
        expect(res.error).to.eql(undefined);
      });
    });
  });
});
