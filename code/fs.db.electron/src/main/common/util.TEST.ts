import { expect } from 'chai';
import { parseDbPath, t } from '.';

describe('util', () => {
  it('parseDbPath', () => {
    const test = (input: string | undefined, path: string, kind: t.DbKind) => {
      const res = parseDbPath(input);
      expect(res.path).to.eql(path);
      expect(res.kind).to.eql(kind);
    };

    test(undefined, '', 'FS');
    test('  ', '', 'FS');
    test('/foo/bar', '/foo/bar', 'FS');
    test('nedb:/foo/bar', '/foo/bar', 'NEDB');
    test('fs:/foo/bar', '/foo/bar', 'FS');
  });
});
