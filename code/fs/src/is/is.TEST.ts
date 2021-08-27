import { expect } from '../test';
import * as fs from 'fs-extra';
import { dirname, join, resolve } from 'path';

import { is } from '.';

const TMP = resolve('./tmp/symlink');
const write = async (path: string) => {
  path = join(TMP, path);
  await fs.ensureDir(dirname(path));
  await fs.writeFile(path, 'foo');
  return path;
};

describe('is', () => {
  beforeEach(async () => await fs.remove(TMP));
  after(async () => await fs.remove('./tmp'));

  it('is: directory', async () => {
    expect(await is.dir('src')).to.eql(true);
    expect(is.dirSync('src')).to.eql(true);
  });

  it('is: not directory', async () => {
    expect(await is.dir('src/index.ts')).to.eql(false);
    expect(await is.dir('')).to.eql(false);
    expect(await is.dir('/NO_EXIST')).to.eql(false);

    expect(is.dirSync('src/index.ts')).to.eql(false);
    expect(is.dirSync('')).to.eql(false);
    expect(is.dirSync('/NO_EXIST')).to.eql(false);
  });

  it('is: file', async () => {
    expect(await is.file('src/index.ts')).to.eql(true);
    expect(is.fileSync('src/index.ts')).to.eql(true);
  });

  it('is: not file', async () => {
    expect(await is.file('src')).to.eql(false);
    expect(await is.file('')).to.eql(false);
    expect(await is.file('/NO_EXIST')).to.eql(false);

    expect(is.fileSync('src')).to.eql(false);
    expect(is.fileSync('')).to.eql(false);
    expect(is.fileSync('/NO_EXIST')).to.eql(false);
  });

  it('is: type', async () => {
    expect(await is.type('src')).to.eql(true);
    expect(await is.type('src', 'DIR')).to.eql(true);
    expect(await is.type('src', 'FILE')).to.eql(false);

    expect(await is.type('src/index.ts')).to.eql(true);
    expect(await is.type('src/index.ts', 'FILE')).to.eql(true);
    expect(await is.type('src/index.ts', 'DIR')).to.eql(false);

    expect(is.typeSync('src')).to.eql(true);
    expect(is.typeSync('src', 'DIR')).to.eql(true);
    expect(is.typeSync('src', 'FILE')).to.eql(false);

    expect(is.typeSync('src/index.ts')).to.eql(true);
    expect(is.typeSync('src/index.ts', 'FILE')).to.eql(true);
    expect(is.typeSync('src/index.ts', 'DIR')).to.eql(false);
  });

  it('is: stream', () => {
    const test = (input: any, expected: boolean) => {
      expect(is.stream(input)).to.eql(expected);
    };

    test(undefined, false);
    test(null, false);
    test('hello', false);
    test(1223, false);
    test({}, false);

    const stream = fs.createReadStream(resolve('./package.json'));
    test(stream, true);
  });

  describe('symlink', () => {
    it('is: not symlink', async () => {
      const test = async (input: any, expected: boolean) => {
        expect(await is.symlink(input)).to.eql(expected);
      };
      await test(undefined, false);
      await test(null, false);
      await test('hello', false);
      await test(1223, false);
      await test({}, false);
    });

    it('is: symlink', async () => {
      const test = async (input: any, expected: boolean) => {
        expect(await is.symlink(input)).to.eql(expected);
      };

      const file = await write('foo/file.txt');
      const link = join(TMP, `foo.link`);
      await fs.symlink(file, link);

      await test(file, false);
      await test(join(TMP, 'foo'), false); // NB: directory.
      await test(link, true);
    });

    it('is: symlink - within {ancestor}', async () => {
      await write('foo/bar/file.txt');
      await fs.symlink(join(TMP, 'foo'), join(TMP, 'foo.link'));

      const test = async (input: string, expected: boolean) => {
        const path = join(TMP, input);
        expect(await is.symlink(path, { ancestor: true })).to.eql(expected);
      };

      await test('foo/bar/file.txt', false);
      await test('foo/bar', false);

      await test('foo.link/bar/file.txt', true);
      await test('foo.link/bar', true);
      await test('foo.link', true);
    });
  });
});
