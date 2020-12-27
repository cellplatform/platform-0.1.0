import { Typescript } from '.';
import { expect, fs, expectError } from '../../test';

describe.only('Typescript', function () {
  this.timeout(99999);

  describe('compiler', () => {
    it('throw: tsconfig file not found', async () => {
      const compiler = Typescript.compiler('foo/bar/tsconfig.json');
      expectError(() => compiler.tsconfig.json(), 'tsconfig file not found');
    });

    it.skip('compile declarations', async () => {
      const compiler = Typescript.compiler('tsconfig.json');
      const res = await compiler.declarations({
        dir: 'tmp/types.d/foo',
        include: 'src/test/test.bundles/node.simple/**/*',
      });

      const expectExists = async (path: string) => {
        const exists = await fs.pathExists(fs.resolve(path));
        expect(exists).to.eql(true);
      };

      await expectExists('tmp/types.d/foo/index.json');
      await expectExists('tmp/types.d/foo/main.d.ts');
      await expectExists('tmp/types.d/@platform/cell.types/index.json');
      await expectExists('tmp/types.d/@platform/log/lib/server/index.json');

      console.log('res', res);
      expect(res.output.manifest.kind).to.eql('types.d');
    });
  });
});
