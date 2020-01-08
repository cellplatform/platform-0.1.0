import { expect, fs, t } from '../test';
import { parse as parseUrl } from 'url';

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

    it('url (simple)', () => {
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

    describe('bucket.url (pre-signed)', () => {
      it('getObject', () => {
        const bucket = s3.bucket('my-bucket');

        const test = (path: string, options: t.S3PresignedUrlArgs) => {
          const res = bucket.url(path, options);
          const url = parseUrl(res, true);
          const query = url.query;

          expect(url.href).to.match(/^https:\/\/my-bucket/);
          expect(url.pathname).to.match(new RegExp(`/${path.replace(/^\/*/, '')}$`));

          expect(query.AWSAccessKeyId).to.eql('MY_KEY');
          expect(query.Signature).to.match(/=$/);
          expect(typeof query.Expires).to.eql('string');

          if (options.seconds !== undefined) {
            const args = { ...options };
            delete args.seconds;
            const urlDefault = parseUrl(bucket.url(path, args), true);
            expect(query.Expires).to.not.eql(urlDefault.query.Expires); // Explicit expiry differs from default.
          }

          const putOptions = options as t.S3PresignedUrlPutObjectArgs;
          if (putOptions.body || putOptions.md5) {
            if (putOptions.md5) {
              expect(query['Content-MD5']).to.eql(putOptions.md5);
            } else {
              expect(query['Content-MD5']).to.match(/==$/);
            }
          } else {
            expect(query['Content-MD5']).to.eql(undefined);
          }
        };

        test('image.png', { operation: 'getObject' });
        test('foo/image.png', { operation: 'getObject' });
        test('/foo/image.png', { operation: 'getObject' });
        test('///foo/image.png', { operation: 'getObject' });
        test('image.png', { operation: 'getObject', seconds: 5 });

        test('image.png', { operation: 'putObject' });
        test('foo/image.png', { operation: 'putObject' });
        test('/foo/image.png', { operation: 'putObject' });
        test('///foo/image.png', { operation: 'putObject' });
        test('image.png', { operation: 'putObject', seconds: 5 });

        test('image.png', { operation: 'putObject', body: Buffer.from('foobar') });
        test('image.png', { operation: 'putObject', md5: '12345678==' });
      });

      it('throws when empty key-path', () => {
        const test = (path?: string) => {
          const bucket = s3.bucket('my-bucket');
          const fn = () => bucket.url(path, { operation: 'getObject' });
          expect(fn).to.throw(/Object key path must be specified/);
        };
        test();
        test('');
        test('  ');
      });
    });
  });
});
