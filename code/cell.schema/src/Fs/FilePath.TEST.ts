import { expect } from '../test';
import { FilePath } from './FilePath';
import { Url } from '../Url';

describe('FilePath', () => {
  describe('fromUrl', () => {
    it('ok (with or without domain)', () => {
      const test = (input: string) => {
        const res = FilePath.fromUrl(input);
        expect(res.ok).to.eql(true);
        expect(res.error).to.eql(undefined);
      };

      test('http://localhost:5000/cell:foo:A1/fs/sample/index.html');
      test('/cell:foo:A1/fs/sample/index.html');
    });

    it('toString (full path)', () => {
      const test = (input: string) => {
        const res = FilePath.fromUrl(input);
        expect(res.toString()).to.eql(Url.parse(input).path);
      };
      test('http://localhost:5000/cell:foo:A1/fs/sample/index.html');
      test('/cell:foo:A1/fs/sample/index.html');
    });

    it('path', () => {
      const test = (input: string, path: string) => {
        const res = FilePath.fromUrl(input);
        expect(res.path).to.eql(path);
      };
      test('http://localhost:5000/cell:foo:A1/fs/sample/index.html', 'sample/index.html');
      test('/cell:foo:A1/fs/sample/index.html', 'sample/index.html');
      test('  /cell:foo:A1/fs/foo/bar/  ', 'foo/bar/');
    });

    it('dir/filename', () => {
      const test = (input: string, dir: string, filename: string) => {
        const res = FilePath.fromUrl(input);
        expect(res.dir).to.eql(dir);
        expect(res.filename).to.eql(filename);
      };
      test('  /cell:foo:A1/fs/sample/index.html  ', 'sample', 'index.html');
      test('  /cell:foo:A1/fs/foo/bar/bird.png  ', 'foo/bar', 'bird.png');
      test('  /cell:foo:A1/fs/foo/bar/  ', 'foo/bar', '');
    });

    it('error: not a cell URI path', () => {
      const test = (url: string) => {
        const res = FilePath.fromUrl(url);
        expect(res.ok).to.eql(false);
        expect(res.error).to.include('path does not start with a cell URI');
      };
      test('http://localhost:5000/ns:foo/bar');
      test('cell:foo:A1/foo/file.html'); // NB: Does not start with "/".
    });

    it('error: not within "/fs" range', () => {
      const test = (url: string) => {
        const res = FilePath.fromUrl(url);
        expect(res.ok).to.eql(false);
        expect(res.error).to.include('not a file-system path (eg "/cell:foo:A1/fs/filename")');
      };
      test('http://localhost:5000/cell:foo:A1/bar');
      test('  /cell:foo:A1/bar  ');
      test('http://localhost:5000/cell:foo:A1');
      test('http://localhost:5000/cell:foo:A1/');
      test('http://localhost:5000/cell:foo:A1///');
    });
  });

  describe('local', () => {
    describe('Path / Location', () => {
      it('toAbsolute', () => {
        const test = (path: string, root: string, expected: string) => {
          const res1 = FilePath.Local.toAbsolutePath({ path, root });
          const res2 = FilePath.Local.toAbsoluteLocation({ path, root });
          expect(res1).to.eql(expected);
          expect(res2).to.eql(`file://${expected}`);
        };

        test('  ', ' /Users/bob/ ', '/Users/bob/');
        test(' /foo/bar.png ', ' /Users/bob/ ', '/Users/bob/foo/bar.png');
        test('foo/bar.png', '/Users/bob', '/Users/bob/foo/bar.png');
        test('foo/bar.png', '/Users/bob///', '/Users/bob/foo/bar.png');
        test('/Users/bob/foo/bar.png', '/Users/bob', '/Users/bob/foo/bar.png');
        test('/Users/bob/foo/bar.png', '/Users/bob/', '/Users/bob/foo/bar.png');

        test(' ~/foo/bar.png', '/Users/bob', '/Users/bob/foo/bar.png'); // NB: Strip home ("~") prefix character.

        // NB: home ("~") prefix character not stripped if part of filename.
        test(' ~foo/bar.png  ', '/Users/bob', '/Users/bob/~foo/bar.png');
        test('/~foo/bar.png', '/Users/bob', '/Users/bob/~foo/bar.png');
      });

      it('toRelative', () => {
        const test = (path: string, root: string, expected: string) => {
          const res1 = FilePath.Local.toRelativePath({ path, root });
          const res2 = FilePath.Local.toRelativeLocation({ path, root });
          expect(res1).to.eql(expected);
          expect(res2).to.eql(`file://${expected}`);
        };

        // No absolute prefix match.
        test(' /foo/bar.png ', ' /Users/bob/ ', '~/foo/bar.png');
        test('///foo/bar.png ', ' /Users/bob/ ', '~/foo/bar.png');
        test(' foo/bar.png ', ' /Users/bob/ ', '~/foo/bar.png');
        test(' ~/foo/bar.png ', ' /Users/bob/ ', '~/foo/bar.png');
        test(' ~//foo/bar.png ', ' /Users/bob/ ', '~/foo/bar.png');

        // Match absolute prefix.
        test(' /Users/bob/foo/bar.png ', ' /Users/bob/ ', '~/foo/bar.png');
        test('file:///Users/bob/foo/bar.png ', ' /Users/bob/ ', '~/foo/bar.png');
      });
    });
  });
});
