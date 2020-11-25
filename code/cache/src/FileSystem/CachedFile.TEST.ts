import { expect } from 'chai';
import { fs } from '@platform/fs';
import { CachedFile, FileCache } from '.';

const tmp = fs.resolve('./tmp');
const dir = fs.join(tmp, 'FileCache');

const getSample = async () => {
  const data = await fs.readFile(fs.resolve('tsconfig.json'));
  const path = 'foo/bar/tsconfig.json';
  const padded = `  //${path}  `;
  return { data, path, padded };
};

describe('CachedFile', () => {
  beforeEach(() => fs.remove(tmp));

  it('create', () => {
    const cache = FileCache.create({ fs, dir });
    const file = CachedFile.create({ cache, path: '  //foo/bar/tsconfig.json  ' });
    expect(file.dir).to.eql(dir);
    expect(file.path).to.eql('foo/bar/tsconfig.json');
  });

  it('put => get => exists', async () => {
    const { data, path, padded } = await getSample();
    const cache = FileCache.create({ fs, dir });
    const file = CachedFile.create({ cache, path: padded });

    expect(file.path).to.eql(path);
    expect(await file.exists()).to.eql(false);

    await file.put(data);
    expect(await file.exists()).to.eql(true);
    expect(await fs.pathExists(fs.join(file.dir, file.path))).to.eql(true);

    const res = await file.get();
    expect(res?.toString()).to.eql(data.toString());
  });

  it('delete', async () => {
    const { data, path } = await getSample();
    const cache = FileCache.create({ fs, dir });
    const file = CachedFile.create({ cache, path });

    expect(await file.exists()).to.eql(false);
    await file.put(data);
    expect(await file.exists()).to.eql(true);

    await file.delete();
    expect(await cache.exists(path)).to.eql(false);
    expect(await file.exists()).to.eql(false);
  });
});
