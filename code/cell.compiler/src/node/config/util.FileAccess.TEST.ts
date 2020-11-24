import { ConfigBuilder } from '.';
import { expect, t } from '../../test';
import { FileAccess } from './util';

describe('FileAccess', () => {
  it('empty list', () => {
    const redirects = FileAccess([]);
    expect(redirects.list).to.eql([]);
  });

  describe('path', () => {
    it('format path', () => {
      const test = (input: any, expected: string) => {
        const fileaccess = FileAccess([]);
        expect(fileaccess.path(input).path).to.eql(expected);
      };
      test('  foo.js  ', 'foo.js');
      test('    ', '');
      test(undefined, '');
      test(null, '');
      test({}, '');
    });

    it('path not matched: empty list => private (default)', () => {
      const fileaccess = FileAccess();
      const res = fileaccess.path('  foo.js  ');

      expect(res.path).to.eql('foo.js');
      expect(res.permission).to.eql('private');
      expect(res.private).to.eql(true);
      expect(res.public).to.eql(false);
    });

    it('match: public', () => {
      const fileaccess = FileAccess([{ permission: 'public', grep: 'src/*.png' }]);

      const test = (path: string | undefined, isPublic: boolean) => {
        const res = fileaccess.path(path);
        expect(res.public).to.eql(isPublic);
      };

      test(undefined, false);
      test('', false);
      test(' ', false);
      test('foo.png', false);
      test('src/foo.js', false);

      test('src/foo.png', true);
    });

    it('last in wins', () => {
      const fileaccess = FileAccess([
        { permission: 'public', grep: 'src/**' },
        { permission: 'private', grep: 'src/**/*.js' },
        { permission: 'public', grep: 'src/be*.js' },
      ]);

      const test = (path: string | undefined, isPublic: boolean) => {
        const res = fileaccess.path(path);
        expect(res.public).to.eql(isPublic);
      };

      test('index.ts', false);
      test('src/foo.png', true);
      test('src/foo/file.js', false);
      test('src/foo/bar/file.js', false);
      test('src/berry.js', true);
    });

    it('complex extension match (".ts{,x}")', () => {
      const fileaccess = FileAccess([{ permission: 'public', grep: 'src/**/*.ts{,x}' }]);

      const test = (path: string | undefined, isPublic: boolean) => {
        const res = fileaccess.path(path);
        expect(res.public).to.eql(isPublic);
      };

      test('foo.ts', false);
      test('src/foo.ts', true);
      test('src/foo.tsx', true);
      test('src/foo.png', false);
    });

    it('complex extension match (images)', () => {
      const fileaccess = FileAccess([{ permission: 'public', grep: '**/*.{png,jpg,svg}' }]);

      const test = (path: string | undefined, isPublic: boolean) => {
        const res = fileaccess.path(path);
        expect(res.public).to.eql(isPublic);
      };

      test('foo.ts', false);
      test('src/foo.png', true);
      test('src/bar/foo.jpg', true);
      test('baz.svg', true);
    });

    it('throw: negation not supported', () => {
      const fn = () => FileAccess([{ permission: 'public', grep: '!src/*.png' }]);
      expect(fn).to.throw(/Path negations \("!"\) not supported/);
    });
  });
});
