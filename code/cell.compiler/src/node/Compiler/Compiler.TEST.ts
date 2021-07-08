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
    expect(typeof Compiler.cell).to.eql('function');
  });

  it('create configuration', () => {
    const config = Compiler.config('myName');
    expect(config.toObject().name).to.eql('myName');
  });

  describe('bundle: output', () => {
    it('dist', async () => {
      const dir = SampleBundles.simpleNode.outdir.dist;
      const manifest = fs.resolve(fs.join(dir, 'index.json'));
      expect(await fs.pathExists(manifest)).to.eql(true);
    });

    it('bundle', async () => {
      const exists = async (path: string) => {
        const dir = SampleBundles.simpleNode.outdir.zipped;
        const target = fs.resolve(fs.join(dir, path));
        expect(await fs.pathExists(target)).to.eql(true);
      };

      await exists(''); // NB: Root folder.
      await exists('dist.json');
      await exists('dist.zip');
    });
  });
});
