import { t, expect, util, PATH } from '../test';
import { local } from '.';

const init = () => local.init({ dir: PATH.LOCAL });

describe('fs.local', () => {
  describe('resolve', () => {
    const fs = init();

    it('throw on invalid URI', () => {
      const test = (uri?: any) => {
        const fn = () => fs.resolve(uri);
        expect(fn).to.throw(/Invalid URI/);
      };

      test();
      test('');
      test('  ');
      test('ns:foo');
      test('cell:foo!A1');
      test('file:boom');
    });

    it('resolve URI as path', () => {
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        expect(res).to.eql(`${PATH.LOCAL}/${expected}`);
      };
      test('file:foo.123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko.1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });
  });

  it('write file', async () => {
    await util.reset();
    const fs = init();

    const png = await util.loadImage('bird.png');
    const uri = 'file:foo.bird';
    const res = await fs.write(uri, png);

    expect(res.error).to.eql(undefined);
    expect(res.file.uri).to.eql(uri);
    expect(res.file.path).to.eql(fs.resolve(uri));
    expect(png.toString()).to.eql((await util.fs.readFile(res.file.path)).toString());
  });

  it('read file', async () => {
    await util.reset();
    const fs = init();

    const png = await util.loadImage('bird.png');
    const uri = 'file:foo.bird';
    const path = fs.resolve(uri);
    await util.fs.ensureDir(util.fs.dirname(path));
    await util.fs.writeFile(path, png);

    const res = await fs.read(uri);
    const file = res.file as t.IFile;
    expect(res.error).to.eql(undefined);
    expect(file.path).to.eql(path);
    expect(file.data.toString()).to.eql((await util.fs.readFile(file.path)).toString());
  });

  it('read file (404 - not found)', async () => {
    await util.reset();
    const fs = init();
    const uri = 'file:foo.noexist';

    const res = await fs.read(uri);
    const error = res.error as t.IFileError;

    expect(res.file).to.eql(undefined);
    expect(error.type).to.eql('FS/404');
    expect(error.path).to.eql(fs.resolve(uri));
    expect(error.message).to.contain(`"file:foo.noexist" does not exist`);
  });
});
