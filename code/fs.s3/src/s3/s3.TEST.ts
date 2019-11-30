import { expect, fs } from '../test';

const s3 = fs.s3({
  endpoint: 'sfo2.digitaloceanspaces.com',
  accessKey: 'MY_KEY',
  secret: 'MY_SECRET',
});

describe('s3', () => {
  describe('s3.url', () => {
    it('throw if bucket not provided', () => {
      const test = (bucket?: any) => {
        const fn = () => s3.url(bucket, '/foo/bar');
        expect(fn).to.throw(/No bucket/);
      };
      test();
      test('');
      test('   ');
    });

    it('url', () => {
      const test = (bucket: string, path?: string, expected?: string) => {
        const res = s3.url(bucket, path);
        expect(res).to.eql(expected);
      };

      test('foo', undefined, 'https://foo.sfo2.digitaloceanspaces.com/');
      test('foo', '', 'https://foo.sfo2.digitaloceanspaces.com/');
      test('foo', '  ', 'https://foo.sfo2.digitaloceanspaces.com/');
      test('..foo...', '', 'https://foo.sfo2.digitaloceanspaces.com/');

      test('foo', 'tmp/file.png', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('foo', '  tmp/file.png  ', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('foo', '/tmp/file.png', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('foo', '///tmp/file.png', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('foo', '  ///tmp/file.png  ', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
    });
  });

  describe('bucket', () => {
    it('bucket.url', () => {
      const bucket = s3.bucket('foo');
      const test = (path?: string, expected?: string) => {
        const res = bucket.url(path);
        expect(res).to.eql(expected);
      };

      test(undefined, 'https://foo.sfo2.digitaloceanspaces.com/');
      test('', 'https://foo.sfo2.digitaloceanspaces.com/');
      test('  ', 'https://foo.sfo2.digitaloceanspaces.com/');
      test('', 'https://foo.sfo2.digitaloceanspaces.com/');

      test('tmp/file.png', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('  tmp/file.png  ', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('/tmp/file.png', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('///tmp/file.png', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
      test('  ///tmp/file.png  ', 'https://foo.sfo2.digitaloceanspaces.com/tmp/file.png');
    });
  });
});
