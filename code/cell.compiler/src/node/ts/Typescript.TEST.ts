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

    it('compile declarations', async () => {
      const model = config.toObject();
      const compiler = Typescript.compiler('tsconfig.json');
      const include = 'src/test/test.bundles/node.simple/**/*';

      const res = await compiler.declarations_OLD({
        base: 'tmp/types.d',
        dir: 'main',
        include,
        model,
      });

      const expectExists = async (path: string) => {
        const exists = await fs.pathExists(fs.resolve(path));
        expect(exists).to.eql(true);
      };

      await expectExists('tmp/types.d/main/index.json');
      await expectExists('tmp/types.d/main/main.d.txt');
      await expectExists('tmp/types.d/@platform/cell.types/index.json');
      await expectExists('tmp/types.d/@platform/log/lib/server/index.json');

      expect(res.tsconfig.include).to.eql([include]);
      expect(res.tsconfig.compilerOptions.emitDeclarationOnly).to.eql(true);

      expect(res.output.base).to.eql(fs.resolve('tmp/types.d'));
      expect(res.output.dir).to.eql(fs.resolve('tmp/types.d/main'));

      const manifest = res.output.manifest;
      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('node.simple');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');
    });
  });
});
