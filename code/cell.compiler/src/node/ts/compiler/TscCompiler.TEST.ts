import { TscCompiler } from '.';
import { expect, fs, expectError, SampleBundles } from '../../../test';

describe('TscCompiler', function () {
  this.timeout(99999);

  const config = SampleBundles.simpleNode.config;

  const TMP = fs.resolve('tmp/test/TscCompiler');

  beforeEach(async () => await fs.remove(TMP));

  describe('tsconfig', () => {
    it('loads tsconfig', async () => {
      const compiler = TscCompiler.create();
      const tsconfig = compiler.tsconfig;
      const json1 = await tsconfig.json();
      const json2 = await tsconfig.json();

      expect(tsconfig.path).to.eql(fs.resolve('tsconfig.json'));
      expect(json1).to.eql(json2);
      expect(json1).to.not.equal(json2);
      expect(json1).to.eql(await fs.readJson(fs.resolve('tsconfig.json')));
    });

    it('throw: file not found', async () => {
      const compiler = TscCompiler.create('foo/bar/tsconfig.json');
      expectError(() => compiler.tsconfig.json(), 'tsconfig file not found');
    });
  });

  describe.only('transpile', () => {
    it('transpile typescript', async () => {
      const model = config.toObject();
      const compiler = TscCompiler.create();

      const outdir = fs.join(TMP, 'foo');
      const source = 'src/test/test.bundles/node.simple/**/*';
      const res = await compiler.transpile({
        source,
        outdir,
        silent: true,
        model,
        compilerOptions: { emitDeclarationOnly: true },
      });

      expect(res.tsconfig.include).to.eql([source]);
      expect(res.tsconfig.compilerOptions.emitDeclarationOnly).to.eql(true);
      expect(res.out.dir).to.eql(outdir);

      const manifest = res.out.manifest;
      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('node.simple');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const trimBase = (path: string) => path.substring(outdir.length + 1);
      const filenames = (await fs.glob.find(`${outdir}/**/*.d.ts`)).map((path) => trimBase(path));
      expect(filenames).to.eql(manifest.files.map((file) => file.path));
    });
  });
});
