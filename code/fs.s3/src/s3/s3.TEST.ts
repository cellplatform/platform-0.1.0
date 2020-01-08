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

    it('url.object', () => {
      const test = (bucket: string, path?: string, expected?: string) => {
        const res = s3.url(bucket, path);
        expect(res.object).to.eql(expected);
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

    it('url.signedGet', () => {
      const res1 = s3.url('foo', '//tmp/file.png').signedGet();
      const res2 = s3.url('foo', 'tmp/file.png').signedGet({ seconds: 5 });

      const url1 = parseUrl(res1, true);
      const url2 = parseUrl(res2, true);

      expect(url1.host).to.eql('foo.sfo2.digitaloceanspaces.com');
      expect(url1.pathname).to.eql('/tmp/file.png');
      expect(url1.query.Signature).to.match(/=$/);
      expect(url1.query.Expires).to.not.eql(url2.query.Expires);
    });

    it('url.signedPut', () => {
      const res1 = s3.url('foo', '//tmp/file.png').signedPut();
      const res2 = s3.url('foo', 'file.png').signedPut({ seconds: 5 });

      const url1 = parseUrl(res1, true);
      const url2 = parseUrl(res2, true);

      expect(url1.host).to.eql('foo.sfo2.digitaloceanspaces.com');
      expect(url1.pathname).to.eql('/tmp/file.png');
      expect(url1.query.Signature).to.match(/=$/);
      expect(url1.query.Expires).to.not.eql(url2.query.Expires);
    });

    it('[signedGet] differs from [signedPut]', () => {
      const get1 = s3.url('foo', 'file.png').signedGet();
      const get2 = s3.url('foo', 'file.png').signedGet();
      const put = s3.url('foo', 'file.png').signedPut();
      expect(get1).to.eql(get2);
      expect(get1).to.not.eql(put);
    });

    it('url.signedPost', () => {
      const res = s3.url('foo', '///tmp/file.png').signedPost();
      expect(res.url).to.eql('https://sfo2.digitaloceanspaces.com/foo');
      expect(res.props['content-type']).to.eql('image/png');
      expect(res.props.key).to.eql('tmp/file.png');
      expect(res.props.bucket).to.eql('foo');
      expect(typeof res.props.Policy).to.eql('string');
    });
  });

  describe('bucket', () => {
    it('bucket.url', () => {
      const bucket = s3.bucket('foo');
      const test = (path?: string, expected?: string) => {
        const res = bucket.url(path);
        expect(res.object).to.eql(expected);
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
      it('signedGet', () => {
        const bucket = s3.bucket('my-bucket');

        const test = (path: string, options: t.S3SignedUrlGetObjectArgs) => {
          const res = bucket.url(path).signedGet(options);
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
            const urlDefault = parseUrl(bucket.url(path).signedGet(args), true);
            expect(query.Expires).to.not.eql(urlDefault.query.Expires); // Explicit expiry differs from default.
          }
        };

        test('image.png', { operation: 'getObject' });
        test('foo/image.png', { operation: 'getObject' });
        test('/foo/image.png', { operation: 'getObject' });
        test('///foo/image.png', { operation: 'getObject' });
        test('image.png', { operation: 'getObject', seconds: 5 });
      });

      it('putObject', () => {
        const bucket = s3.bucket('my-bucket');

        const test = (path: string, options: t.S3SignedUrlPutObjectArgs) => {
          const res = bucket.url(path).signedPut(options);
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
            const urlDefault = parseUrl(bucket.url(path).signedGet(args), true);
            expect(query.Expires).to.not.eql(urlDefault.query.Expires); // Explicit expiry differs from default.
          }

          if (options.body || options.md5) {
            if (options.md5) {
              expect(query['Content-MD5']).to.eql(options.md5);
            } else {
              expect(query['Content-MD5']).to.match(/==$/);
            }
          } else {
            expect(query['Content-MD5']).to.eql(undefined);
          }
        };

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
          const err = /Object key path must be specified/;
          expect(() => bucket.url(path).signedGet()).to.throw(err);
          expect(() => bucket.url(path).signedPut()).to.throw(err);
          expect(() => bucket.url(path).signedPost()).to.throw(err);
        };
        test();
        test('');
        test('  ');
      });
    });
  });
});
