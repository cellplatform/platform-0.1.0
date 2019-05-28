import { expect } from 'chai';
import { fs } from '..';
import { Zipper, IZipProgress, unzip } from '.';

const TMP = fs.resolve('./tmp');

const exepectFiles = async (paths: string[]) => {
  for (const path of paths) {
    const exists = await fs.pathExists(fs.resolve(path));
    expect(exists).to.eql(true, `Should exist: ${path}`);
  }
};

describe('zip', () => {
  afterEach(async () => fs.remove(TMP));

  it('zips file', async () => {
    const zip = new Zipper();
    zip
      //
      .add('./test/file/foo.yaml')
      .add('./test/file/package.json', 'my-dir');
    const res = await zip.save('./tmp/foo.zip');
    expect(res.bytes).to.greaterThan(140);

    await unzip('./tmp/foo.zip', './tmp/unzipped');
    await exepectFiles(['./tmp/unzipped/foo.yaml', './tmp/unzipped/my-dir/package.json']);
  });

  it('zips folder', async () => {
    const zip = new Zipper().add('./test/file');
    await zip.save('./tmp/foo.zip');
    await unzip('./tmp/foo.zip', './tmp/unzipped');
    await exepectFiles([
      './tmp/unzipped/fail.json',
      './tmp/unzipped/fail.yml',
      './tmp/unzipped/file',
      './tmp/unzipped/file.doc',
      './tmp/unzipped/foo.json',
      './tmp/unzipped/foo.yaml',
      './tmp/unzipped/foo.yml',
      './tmp/unzipped/package.json',
    ]);
  });

  it('zips folder (within sub-directory)', async () => {
    await fs.zip('./test/file', 'stuff').save('./tmp/foo.zip');
    await fs.unzip('./tmp/foo.zip', './tmp/unzipped');
    await exepectFiles([
      './tmp/unzipped/stuff/fail.json',
      './tmp/unzipped/stuff/fail.yml',
      './tmp/unzipped/stuff/file',
      './tmp/unzipped/stuff/file.doc',
      './tmp/unzipped/stuff/foo.json',
      './tmp/unzipped/stuff/foo.yaml',
      './tmp/unzipped/stuff/foo.yml',
      './tmp/unzipped/stuff/package.json',
    ]);
  });

  it('fires processed event', async () => {
    const zip = new Zipper().add('./test/file');
    const events: IZipProgress[] = [];
    await zip.save('./tmp/foo.zip', { onProgress: e => events.push(e) });

    expect(events.length).to.eql(8);

    expect(events[0].isComplete).to.eql(false);
    expect(events[0].processed).to.eql(1);
    expect(events[0].percent).to.be.lessThan(0.25);

    expect(events[7].isComplete).to.eql(true);
    expect(events[7].processed).to.eql(8);
    expect(events[7].percent).to.eql(1);
  });
});
