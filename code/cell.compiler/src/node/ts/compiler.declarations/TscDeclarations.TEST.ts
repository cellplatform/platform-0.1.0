import { TscCompiler } from '../compiler';
import { expect, fs, SampleBundles } from '../../../test';

describe.only('TscDeclarations', function () {
  this.timeout(99999);

  const config = SampleBundles.simpleNode.config;
  const TMP = fs.resolve('tmp/test/TscDeclarations');

  beforeEach(async () => await fs.remove(TMP));

  it('transpile declarations', async () => {
    const model = config.toObject();
    const compiler = TscCompiler.create();

    const outdir = fs.join(TMP, 'foo');
    const source = 'src/test/test.bundles/node.simple/**/*';

    const res = await compiler.declarations.transpile({
      source,
      outdir,
      silent: true,
      model,
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
