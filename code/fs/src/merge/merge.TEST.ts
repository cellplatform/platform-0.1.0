import { expect, expectError } from '@platform/test';
import { fs } from '..';

const writeFile = async (path: string, text: string = 'message: hello\n') => {
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, text);
};

const expectExists = async (path: string, includesText?: string) => {
  expect(await fs.pathExists(path)).to.eql(true, `Path should exist '${path}'`);
  if (includesText) {
    const text = await fs.readFile(path, 'utf8');
    expect(text.includes(includesText)).to.eql(true, `Text should include '${includesText}'`);
  }
};

describe('fs.merge', () => {
  beforeEach(async () => fs.remove('tmp'));
  after(async () => fs.remove('tmp'));

  it('throws if target is not a directory', async () => {
    const target = 'tmp/merge/my-file.txt';
    await writeFile(target);
    expectError(() => fs.merge('lib', target), 'not a directory');
  });

  it('throws if source is not a directory', async () => {
    await fs.ensureDir('tmp/merge');
    const test = async (source: string | string[]) => {
      await expectError(() => fs.merge(source, 'tmp/merge'), 'not a directory');
    };
    await test('test/merge/folder-1/child-1.yml');
    await test(['test/merge/folder-1/child-1.yml']);
    await test('test/merge/folder-1/**');
    await test(['test/merge/folder-1/*']);
  });

  it('merges nothing (nothing matching glob patern)', async () => {
    const dir = 'tmp/merge';
    await fs.ensureDir(dir);
    expect(await fs.readdir(dir)).to.eql([]);

    const test = async (source: string | string[], pattern: string) => {
      await fs.merge(source, dir, { pattern });
      expect(await fs.readdir(dir)).to.eql([]);
    };
    await test('test/merge/folder-1', '');
    await test('test/merge/folder-1', '**/*.blob');
  });

  it('merges one folder into target', async () => {
    await writeFile('tmp/merge/start.yml');
    await writeFile('tmp/merge/child/hello.yml');

    const res = await fs.merge('test/merge/folder-1', 'tmp/merge');

    expect(res.from).to.include('test/merge/folder-1/child-1.yml');
    expect(res.from).to.include('test/merge/folder-1/child-2.yml');

    expect(res.to).to.include('tmp/merge/child-1.yml');
    expect(res.to).to.include('tmp/merge/child-2.yml');
    expect(res.skipped).to.eql([]);

    expectExists('tmp/merge/start.yml');
    expectExists('tmp/merge/child-1.yml');
    expectExists('tmp/merge/child-2.yml');
  });

  it('merges without overwriting (default)', async () => {
    await writeFile('tmp/merge/child-1.yml', 'Hello!');
    const res = await fs.merge('test/merge/folder-1', 'tmp/merge');

    // console.log('-------------------------------------------');
    // console.log('res', inspect(res, { depth: 10, colors: true }));

    expect(res.to).to.not.include('tmp/merge/child-1.yml');
    expect(res.to).to.include('tmp/merge/child-2.yml');
    expect(res.skipped).to.eql(['test/merge/folder-1/child-1.yml']);

    expectExists('tmp/merge/child-1.yml', 'Hello!');
    expectExists('tmp/merge/child-2.yml');
  });

  it('merges and overwrites', async () => {
    await writeFile('tmp/merge/child-1.yml', 'Hello!');
    const res = await fs.merge('test/merge/folder-1', 'tmp/merge', {
      overwrite: true,
    });

    expect(res.to).to.include('tmp/merge/child-1.yml');
    expect(res.to).to.include('tmp/merge/child-2.yml');
    expect(res.skipped).to.eql([]);

    expectExists('tmp/merge/child-1.yml', 'child-1');
    expectExists('tmp/merge/child-2.yml');
  });

  it('merges deep without overwriting', async () => {
    await writeFile('tmp/merge/child-1.yml', 'Hello!');
    await writeFile('tmp/merge/subfolder/foo.txt', 'Foo');

    const res = await fs.merge('test/merge/folder-2', 'tmp/merge');
    expect(res.skipped).to.eql(['test/merge/folder-2/child-1.yml']);

    expectExists('tmp/merge/child-1.yml', 'Hello!');
    expectExists('tmp/merge/child-2.yml');
    expectExists('tmp/merge/subfolder/foo.txt', 'Foo');
    expectExists('tmp/merge/subfolder/grandchild-1.yml', 'grandchild-1');
  });

  it('merges deep and overwrites', async () => {
    await writeFile('tmp/merge/child-1.yml', 'Hello!');
    await writeFile('tmp/merge/subfolder/foo.txt', 'Foo');

    const res = await fs.merge('test/merge/folder-2', 'tmp/merge', {
      overwrite: true,
    });
    expect(res.skipped).to.eql([]);

    expectExists('tmp/merge/child-1.yml', 'child-1');
    expectExists('tmp/merge/child-2.yml');
    expectExists('tmp/merge/subfolder/foo.txt', 'Foo');
    expectExists('tmp/merge/subfolder/grandchild-1.yml', 'grandchild-1');
  });

  it('merges image', async () => {
    await writeFile('tmp/merge/start.yml', 'Hello!');
    await fs.merge('test/merge/folder-3', 'tmp/merge');
    expectExists('tmp/merge/start.yml');
    expectExists('tmp/merge/image.png');
  });

  /**
   * - merge deep
   * - merge image (binary)
   */
});
