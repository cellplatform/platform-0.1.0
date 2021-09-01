import { expect, TestUtil, t } from '../test';
import { PathUtil } from '.';

describe('PathUtil', () => {
  beforeEach(() => TestUtil.reset());

  const fs = TestUtil.node;
  const dir = TestUtil.PATH.LOCAL;
  const copy = async (target: string) => TestUtil.copyImage('bird.png', target);

  it('empty', async () => {
    const res = await PathUtil.files({ fs, dir });
    expect(res).to.eql([]);
  });

  it('root file (no recursion)', async () => {
    const path = await copy('root.png');
    const res = await PathUtil.files({ fs, dir });
    expect(res).to.eql([path]);
  });

  it('files (deep)', async () => {
    const path1 = await copy('1.png');
    const path2 = await copy('foo/1.png');
    const path3 = await copy('foo/2.png');
    const path4 = await copy('foo/bar/a.png');
    const path5 = await copy('zoo/1.png');

    const res = await PathUtil.files({ fs, dir });
    expect(res).to.eql([path1, path2, path3, path4, path5]);
  });

  it('files (not deep)', async () => {
    const paths = {
      path1: await copy('1.png'),
      path2: await copy('foo/1.png'),
    };
    const res = await PathUtil.files({ fs, dir, deep: false });
    expect(res).to.eql([paths.path1]);
  });

  it('filter', async () => {
    const paths = {
      path1: await copy('1.png'),
      path2: await copy('foo/1.png'),
      path3: await copy('foo/2.png'),
      path4: await copy('foo/bar/a.png'),
      path5: await copy('zoo/1.png'),
    };

    const filter: t.FsPathFilter = (e) => !e.path.endsWith('1.png');

    const res = await PathUtil.files({ fs, dir, filter });
    expect(res).to.eql([paths.path3, paths.path4]);
  });
});
