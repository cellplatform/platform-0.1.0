import { Compiler } from '.';
import { expect, SampleBundles, fs } from '../../test';

describe('Compiler', function () {
  this.timeout(30000);

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle({ force });
  });

  it('static entry', () => {
    expect(typeof Compiler.bundle).to.eql('function');
    expect(typeof Compiler.config).to.eql('function');
    expect(typeof Compiler.devserver).to.eql('function');
    expect(typeof Compiler.watch).to.eql('function');
  });

  it('toObject', () => {
    const config = Compiler.config('myName');
    const obj = config.toObject();
    expect(obj.name).to.eql('myName');
    expect(obj.outdir).to.eql('dist');
  });

  it('toPaths', () => {
    const config = Compiler.config();
    const paths = config.toPaths();
    expect(paths.out.base).to.eql('dist');
    expect(paths.out.dist).to.eql('dist/web');
    expect(paths.out.bundle).to.eql('dist/web.bundle');
  });

  describe('bundle: output', () => {
    it('compiles output files', async () => {
      const test = async (pattern: string) => {
        const dir = SampleBundles.simpleNode.paths.out.dist;
        const files = await fs.glob.find(`${dir}/${pattern}`);
        expect(files.length).to.greaterThan(0);
      };
      await test('**/*.js');
      await test('**/*.json');
      await test('**/*.svg');
      await test('**/*.jpg');
      await test('**/*.png');
      await test('**/*.txt');
    });

    it('dir: <dist>', async () => {
      const dir = SampleBundles.simpleNode.paths.out.dist;
      const manifest = fs.resolve(fs.join(dir, 'index.json'));
      expect(await fs.pathExists(manifest)).to.eql(true);
    });

    it('dir: <dist>.bundle (zip)', async () => {
      const exists = async (path: string) => {
        const dir = SampleBundles.simpleNode.paths.out.bundle;
        const target = fs.resolve(fs.join(dir, path));
        expect(await fs.pathExists(target)).to.eql(true);
      };
      await exists(''); // NB: Root folder.
      await exists('index.json');
      await exists('dist.zip');
      await exists('dist.zip.json');
    });
  });
});
