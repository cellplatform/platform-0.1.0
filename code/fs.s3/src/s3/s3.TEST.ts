import { expect, fs, t } from '../test';
import { parse as parseUrl } from 'url';

const accessKey = 'MY_KEY';
const secret = 'MY_SECRET';

describe('s3', () => {
  describe('s3.endpoint', () => {
    it('origin only (string)', () => {
      const res = fs.s3({ endpoint: '  foo.com  ', accessKey, secret });
      expect(res.endpoint.origin).to.eql('foo.com');
      expect(res.endpoint.edge).to.eql(undefined);
    });

    it('origin ({ object })', () => {
      const res1 = fs.s3({ endpoint: { origin: '  foo.com  ' }, accessKey, secret });
      expect(res1.endpoint.origin).to.eql('foo.com');
      expect(res1.endpoint.edge).to.eql(undefined);

      const res2 = fs.s3({ endpoint: { origin: '  foo.com  ', edge: '  ' }, accessKey, secret });
      expect(res2.endpoint.origin).to.eql('foo.com');
      expect(res2.endpoint.edge).to.eql(undefined);
    });

    it('origin AND edge', () => {
      const res = fs.s3({
        endpoint: { origin: '  foo.com  ', edge: '   cdn.foo.com   ' },
        accessKey,
        secret,
      });

      expect(res.endpoint.origin).to.eql('foo.com');
      expect(res.endpoint.edge).to.eql('cdn.foo.com');
    });

    it('bucket endpoint', () => {
      const s3 = fs.s3({
        endpoint: { origin: '  foo.com  ', edge: '   cdn.foo.com   ' },
        accessKey,
        secret,
      });

      const bucket = s3.bucket('myBucket');
      expect(s3.endpoint).to.eql(bucket.endpoint);
      expect(bucket.endpoint.origin).to.eql('foo.com');
      expect(bucket.endpoint.edge).to.eql('cdn.foo.com');
    });
  });

  describe('s3.url', () => {
    it('throw if bucket not provided', () => {
      const s3 = fs.s3({ endpoint: 'sfo.domain.com', accessKey, secret });

      const test = (bucket?: any) => {
        const fn = () => s3.url(bucket, '/foo/bar');
        expect(fn).to.throw(/No bucket/);
      };
      test();
      test('');
      test('   ');
    });

    it('url.object', () => {
      const s3 = fs.s3({ endpoint: 'sfo.domain.com', accessKey, secret });

      const test = (bucket: string, path: string, expected?: string) => {
        const res = s3.url(bucket, path);
        expect(res.object).to.eql(expected);
      };

      test('foo', undefined as any, 'https://foo.sfo.domain.com/');
      test('foo', '', 'https://foo.sfo.domain.com/');
      test('foo', '  ', 'https://foo.sfo.domain.com/');
      test('..foo...', '', 'https://foo.sfo.domain.com/');

      test('foo', 'tmp/file.png', 'https://foo.sfo.domain.com/tmp/file.png');
      test('foo', '  tmp/file.png  ', 'https://foo.sfo.domain.com/tmp/file.png');
      test('foo', '/tmp/file.png', 'https://foo.sfo.domain.com/tmp/file.png');
      test('foo', '///tmp/file.png', 'https://foo.sfo.domain.com/tmp/file.png');
      test('foo', '  ///tmp/file.png  ', 'https://foo.sfo.domain.com/tmp/file.png');
    });

    it('url.signedGet', () => {
      const s3 = fs.s3({ endpoint: 'sfo.domain.com', accessKey, secret });

      const res1 = s3.url('foo', '//tmp/file.png').signedGet();
      const res2 = s3.url('foo', 'tmp/file.png').signedGet({ expires: '5s' });

      const url1 = parseUrl(res1, true);
      const url2 = parseUrl(res2, true);

      expect(url1.host).to.eql('foo.sfo.domain.com');
      expect(url1.pathname).to.eql('/tmp/file.png');
      expect(url1.query.Signature).to.match(/=$/);
      expect(url1.query.Expires).to.not.eql(url2.query.Expires);
    });

    it('url.signedPut', () => {
      const s3 = fs.s3({ endpoint: 'sfo.domain.com', accessKey, secret });

      const res1 = s3.url('foo', '//tmp/file.png').signedPut();
      const res2 = s3.url('foo', 'file.png').signedPut({ expires: '5s' });

      const url1 = parseUrl(res1, true);
      const url2 = parseUrl(res2, true);

      expect(url1.host).to.eql('foo.sfo.domain.com');
      expect(url1.pathname).to.eql('/tmp/file.png');
      expect(url1.query.Signature).to.match(/=$/);
      expect(url1.query.Expires).to.not.eql(url2.query.Expires);
    });

    it('[signedGet] differs from [signedPut]', () => {
      const s3 = fs.s3({ endpoint: 'sfo.domain.com', accessKey, secret });

      const get1 = s3.url('foo', 'file.png').signedGet();
      const get2 = s3.url('foo', 'file.png').signedGet();
      const put = s3.url('foo', 'file.png').signedPut();
      expect(get1).to.eql(get2);
      expect(get1).to.not.eql(put);
    });

    it('url.signedPost', () => {
      const s3 = fs.s3({ endpoint: 'sfo.domain.com', accessKey, secret });

      const res = s3.url('foo', '///tmp/file.png').signedPost();
      expect(res.url).to.eql('https://sfo.domain.com/foo');
      expect(res.props['content-type']).to.eql('image/png');
      expect(res.props.key).to.eql('tmp/file.png');
      expect(res.props.bucket).to.eql('foo');
      expect(typeof res.props.Policy).to.eql('string');
    });

    it('url: edge', () => {
      const endpoint = { origin: 'domain.com', edge: 'cdn.domain.com' };
      const s3 = fs.s3({ endpoint, accessKey, secret });
      const url = s3.url('foo', 'tmp/file.png');

      // GET (edge network applicable).
      expect(url.object).to.eql('https://foo.cdn.domain.com/tmp/file.png');
      expect(url.signedGet()).to.include('https://foo.cdn.domain.com/tmp/file.png?');

      // Not edge addressable.
      expect(url.signedPost().url).to.eql('https://domain.com/foo');
      expect(url.signedPut()).to.include('https://foo.domain.com/tmp/file.png?');
    });
  });

  describe('bucket', () => {
    const s3 = fs.s3({ endpoint: 'sfo.domain.com', accessKey, secret });

    it('bucket.url', () => {
      const bucket = s3.bucket('foo');
      const test = (path: string, expected?: string) => {
        const res = bucket.url(path);
        expect(res.object).to.eql(expected);
      };

      test(undefined as any, 'https://foo.sfo.domain.com/');
      test('', 'https://foo.sfo.domain.com/');
      test('  ', 'https://foo.sfo.domain.com/');
      test('', 'https://foo.sfo.domain.com/');

      test('tmp/file.png', 'https://foo.sfo.domain.com/tmp/file.png');
      test('  tmp/file.png  ', 'https://foo.sfo.domain.com/tmp/file.png');
      test('/tmp/file.png', 'https://foo.sfo.domain.com/tmp/file.png');
      test('///tmp/file.png', 'https://foo.sfo.domain.com/tmp/file.png');
      test('  ///tmp/file.png  ', 'https://foo.sfo.domain.com/tmp/file.png');
    });

    it('bucket.url: edge', () => {
      const endpoint = { origin: 'domain.com', edge: 'cdn.domain.com' };
      const s3 = fs.s3({ endpoint, accessKey, secret });
      const bucket = s3.bucket('foo');
      const url = bucket.url('tmp/file.png');

      // GET (edge network applicable).
      expect(url.object).to.eql('https://foo.cdn.domain.com/tmp/file.png');
      expect(url.signedGet()).to.include('https://foo.cdn.domain.com/tmp/file.png?');

      // Not edge addressable.
      expect(url.signedPost().url).to.eql('https://domain.com/foo');
      expect(url.signedPut()).to.include('https://foo.domain.com/tmp/file.png?');
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

          if (options.expires !== undefined) {
            const args = { ...options };
            delete args.expires;
            const urlDefault = parseUrl(bucket.url(path).signedGet(args), true);
            expect(query.Expires).to.not.eql(urlDefault.query.Expires); // Explicit expiry differs from default.
          }
        };

        test('image.png', { operation: 'getObject' });
        test('foo/image.png', { operation: 'getObject' });
        test('/foo/image.png', { operation: 'getObject' });
        test('///foo/image.png', { operation: 'getObject' });
        test('image.png', { operation: 'getObject', expires: '5s' });
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

          if (options.expires !== undefined) {
            const args = { ...options };
            delete args.expires;
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
        test('image.png', { operation: 'putObject', expires: '5s' });

        test('image.png', { operation: 'putObject', body: Buffer.from('foobar') });
        test('image.png', { operation: 'putObject', md5: '12345678==' });
      });

      it('throws when empty key-path', () => {
        const test = (path: string) => {
          const bucket = s3.bucket('my-bucket');
          const err = /Object key path must be specified/;
          expect(() => bucket.url(path).signedGet()).to.throw(err);
          expect(() => bucket.url(path).signedPut()).to.throw(err);
          expect(() => bucket.url(path).signedPost()).to.throw(err);
        };
        test(undefined as any);
        test('');
        test('  ');
      });
    });
  });
});
