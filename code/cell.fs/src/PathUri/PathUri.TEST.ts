import { expect } from '../test';
import { PathUri } from '.';

describe('PathUri', () => {
  it('prefix', () => {
    expect(PathUri.prefix).to.eql('path');
  });

  it('is', () => {
    const test = (input: any, expected: boolean) => {
      expect(PathUri.is(input)).to.eql(expected);
    };

    test('path:foo/bar.txt', true);
    test('  path:foo/bar.txt  ', true);

    test('file:foo:123', false);
    test('  file:foo:123  ', false);
    test('', false);
    test('/foo', false);
    test(null, false);
    test({}, false);
  });

  it('path', () => {
    const test = (input: any, expectedPath: string | undefined) => {
      expect(PathUri.path(input)).to.eql(expectedPath);
    };

    test('', undefined);
    test('foo/bar', undefined);
    test(null, undefined);
    test({}, undefined);

    test('path:foo/bar', 'foo/bar');
    test('  path:foo/bar  ', 'foo/bar');
    test('path:///foo/bar', 'foo/bar');
    test('path:foo/bar/', 'foo/bar/');

    test('path:', '');
    test('  path:  ', '');

    test('path:./foo', 'foo');
    test('path:../foo', '');
    test('path:....../foo', 'foo');
    test('path:foo/../bar', 'bar');
    test('path:foo/../../bar', ''); // NB: Stepped up and out of scope.
    test('path:foo/../../../bar', ''); // NB: Stepped up and out of scope.
    test('path:foo/bar/../zoo', 'foo/zoo');
  });
});
