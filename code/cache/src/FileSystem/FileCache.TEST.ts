import { expect } from 'chai';
import { fs } from '@platform/fs';
import { FileCache } from '.';

const tmp = fs.resolve('./tmp');
const dir = fs.join(tmp, 'FileCache');

const getSample = async () => {
  const data = await fs.readFile(fs.resolve('tsconfig.json'));
  const path = 'foo/bar/tsconfig.json';
  const padded = `  //${path}  `;
  return { data, path, padded };
};

describe('FileCache', () => {
  beforeEach(() => fs.remove(tmp));

  it('create', async () => {
    const cache = FileCache.create({ fs, dir: `   ${dir}//   ` });
    expect(cache.dir).to.eql(dir);
  });

  it('put => get => exists', async () => {
    const { data, path, padded } = await getSample();

    const cache = FileCache.create({ fs, dir });
    expect(await fs.pathExists(dir)).to.eql(false);

    expect(await cache.exists(path)).to.eql(false);

    await cache.put(padded, data);
    expect(await cache.exists(padded)).to.eql(true);
    expect(await fs.pathExists(fs.join(dir, path))).to.eql(true);

    const res = await cache.get(padded);
    expect(res?.toString()).to.eql(data.toString());
  });

  it('delete', async () => {
    const { data, path, padded } = await getSample();
    const cache = FileCache.create({ fs, dir });

    expect(await cache.exists(path)).to.eql(false);
    await cache.put(padded, data);
    expect(await cache.exists(padded)).to.eql(true);

    await cache.delete(padded);
    expect(await cache.exists(path)).to.eql(false);
    expect(await fs.pathExists(dir)).to.eql(true); // NB: Containing folder still exists.
  });

  it('clear', async () => {
    const { data, path } = await getSample();
    const cache = FileCache.create({ fs, dir });
    expect(await fs.pathExists(dir)).to.eql(false);

    await cache.put(path, data);
    expect(await fs.pathExists(dir)).to.eql(true);

    await cache.clear();
    expect(await fs.pathExists(dir)).to.eql(false);
  });

  it('cache.file(path)', async () => {
    const { data, path, padded } = await getSample();
    const cache = FileCache.create({ fs, dir });
    const file = cache.file(padded);

    expect(file.path).to.eql(path);
    expect(file.dir).to.eql(dir);

    expect(await file.exists()).to.eql(false);
    await file.put(data);
    expect(await file.exists()).to.eql(true);

    const res = await file.get();
    expect(res?.toString()).to.eql(data.toString());
  });
});
