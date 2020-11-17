import { parse as parseUrl } from 'url';
import { expect, util } from '../test';

const PROVIDER = 'SPACES';

describe('S3', () => {
  it('type: "S3"', () => {
    const { fs } = util.init(PROVIDER);
    expect(fs.type).to.eql('S3');
  });

  describe('paths', () => {
    it('throws if no bucket in path', () => {
      const test = (path: string) => {
        const fn = () => util.init(PROVIDER, path);
        expect(fn).to.throw(/does not contain a bucket/);
      };
      test(' ');
      test('/');
      test(' / ');
      test('///');
      test(' /// ');
    });

    it('paths', () => {
      const test = (root: string, expectedBucket: string, expectedDir: string) => {
        const { fs } = util.init(PROVIDER, root);
        expect(fs.bucket).to.eql(expectedBucket, `bucket: ${expectedBucket}`);
        expect(fs.dir).to.eql(expectedDir, `dir (root): ${expectedDir}`);
      };

      test('platform/tmp/test', 'platform', '/tmp/test');
      test('platform/  tmp/test  ', 'platform', '/tmp/test');

      test('/platform/tmp/test', 'platform', '/tmp/test');
      test('//platform/tmp/test', 'platform', '/tmp/test');
      test('//platform/  tmp/test  ', 'platform', '/tmp/test');

      test('platform', 'platform', '/');
      test('   platform   ', 'platform', '/');
      test('/platform', 'platform', '/');
      test('/platform/', 'platform', '/');
      test(' /platform/ ', 'platform', '/');
      test('///platform///', 'platform', '/');
      test('  ///platform///  ', 'platform', '/');
    });

    it('resolve (DEFAULT)', () => {
      const { fs, PATH } = util.init(PROVIDER);

      const test = (uri: string, expected: string) => {
        const res1 = fs.resolve(uri);
        const res2 = fs.resolve(uri, { type: 'DEFAULT', endpoint: 'origin' });

        expect(res1.path).to.eql(`https://${fs.bucket}.${fs.endpoint.edge}/${PATH}/${expected}`);
        expect(res2.path).to.eql(`https://${fs.bucket}.${fs.endpoint.origin}/${PATH}/${expected}`);

        expect(res1.props).to.eql({});
        expect(res2.props).to.eql({});
      };

      test('file:foo:123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });

    it('resolve (SIGNED/get)', () => {
      const { fs, BUCKET, ENDPOINT } = util.init(PROVIDER);
      const res1 = fs.resolve('file:foo:123', { type: 'SIGNED/get', expires: '5m' });
      const res2 = fs.resolve('file:foo:123', {
        type: 'SIGNED/get',
        expires: '5m',
        endpoint: 'origin',
      });

      const url1 = parseUrl(res1.path, true);
      const url2 = parseUrl(res2.path, true);

      expect(res1.props).to.eql({});
      expect(res2.props).to.eql({});

      expect(url1.host).to.eql(`${BUCKET}.${ENDPOINT.edge}`);
      expect(url2.host).to.eql(`${BUCKET}.${ENDPOINT.origin}`);

      expect(url1.pathname).to.eql('/tmp/test/ns.foo/123');
      expect(url2.pathname).to.eql(url1.pathname);

      expect(url1.query.Signature).to.match(/=$/);
      expect(url2.query.Signature).to.eql(url1.query.Signature);
    });

    it('resolve (SIGNED/put)', () => {
      const { fs, BUCKET, ENDPOINT } = util.init(PROVIDER);
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/put', expires: '5m' });
      const url = parseUrl(res.path, true);
      expect(res.props).to.eql({});
      expect(url.host).to.eql(`${BUCKET}.${ENDPOINT.origin}`);
      expect(url.pathname).to.eql('/tmp/test/ns.foo/123');
      expect(url.query.Signature).to.match(/=$/);
    });

    it('resolve (SIGNED/post)', () => {
      const { fs, BUCKET, ENDPOINT } = util.init(PROVIDER);
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/post', expires: '5m' });
      expect(res.path).to.eql(`https://${ENDPOINT.origin}/${BUCKET}`);
      expect(res.props.bucket).to.eql(BUCKET);
      expect(res.props.key).to.eql('tmp/test/ns.foo/123');
      expect(typeof res.props.Policy).to.eql('string');
      expect(typeof res.props['X-Amz-Signature']).to.eql('string');
    });
  });
});
