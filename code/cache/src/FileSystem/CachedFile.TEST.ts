import { expect } from 'chai';
import { fs } from '@platform/fs';
import { CachedFile, FileCache } from '.';

const tmp = fs.resolve('./tmp');
const dir = fs.join(tmp, 'FileCache');

describe('CachedFile', () => {
  beforeEach(() => fs.remove(tmp));

  it('create', () => {
    const cache = FileCache.create({ fs, dir });
    const file = CachedFile.create({ cache, path: '  //foo/bar/tsconfig.json  ' });
    expect(file.dir).to.eql(dir);
    expect(file.path).to.eql('foo/bar/tsconfig.json');
  });

  it('put => get => exists', async () => {
    const cache = FileCache.create({ fs, dir });

    const data = await fs.readFile(fs.resolve('tsconfig.json'));
    const path = 'foo/bar/tsconfig.json';
    const pathPadded = `  //${path}  `;

    const file = CachedFile.create({ cache, path: pathPadded });
    expect(await file.exists()).to.eql(false);

    await file.put(data);
    expect(await file.exists()).to.eql(true);
    expect(await fs.pathExists(fs.join(file.dir, file.path))).to.eql(true);

    const res = await file.get();
    expect(res?.toString()).to.eql(data.toString());
  });
});
