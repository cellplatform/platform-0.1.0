import { Typescript } from '.';
import { expect, fs, expectError } from '../../test';

describe('Typescript', function () {
  this.timeout(99999);

  describe('compiler', () => {
    it('throw: tsconfig file not found', async () => {
      const compiler = Typescript.compiler('foo/bar/tsconfig.json');
      expectError(() => compiler.tsconfig.json(), 'tsconfig file not found');
    });

    it('compile declarations', async () => {
      const compiler = Typescript.compiler('tsconfig.json');
      const include = 'src/test/test.bundles/node.simple/**/*';

      const res = await compiler.declarations({
        base: 'tmp/types.d',
        dir: 'foo',
        include,
      });

      const expectExists = async (path: string) => {
        const exists = await fs.pathExists(fs.resolve(path));
        expect(exists).to.eql(true);
      };

      await expectExists('tmp/types.d/foo/index.json');
      await expectExists('tmp/types.d/foo/main.d.ts');
      await expectExists('tmp/types.d/@platform/cell.types/index.json');
      await expectExists('tmp/types.d/@platform/log/lib/server/index.json');

      expect(res.tsconfig.include).to.eql([include]);
      expect(res.tsconfig.compilerOptions.emitDeclarationOnly).to.eql(true);

      expect(res.output.manifest.kind).to.eql('types.d');
      expect(res.output.base).to.eql(fs.resolve('tmp/types.d'));
      expect(res.output.dir).to.eql(fs.resolve('tmp/types.d/foo'));
    });
  });
});
